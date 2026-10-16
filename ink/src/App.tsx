import React, { useReducer } from 'react';
import { Box, useApp } from 'ink';
import { useSafeInput } from './hooks/useSafeInput.js';
import { cliReducer, createInitialState } from './core/state-machine.js';
import { ActiveScreen, ReviewReport } from './types/contracts.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { WelcomeScreen } from './screens/WelcomeScreen.js';
import { AuthScreen } from './screens/AuthScreen.js';
import { PrEntryScreen } from './screens/PrEntryScreen.js';
import { InspectScreen } from './screens/InspectScreen.js';
import { SpecialistScreen } from './screens/SpecialistScreen.js';
import { ConsensusScreen } from './screens/ConsensusScreen.js';
import { ReportScreen } from './screens/ReportScreen.js';
import { PublishScreen } from './screens/PublishScreen.js';
import { ErrorScreen } from './screens/ErrorScreen.js';

interface AppProps {
  initialScreen?: ActiveScreen;
  initialPrUrl?: string;
  initialReport?: ReviewReport;
  isDemo?: boolean;
}

export function App({ initialScreen = "welcome", initialPrUrl, initialReport, isDemo = true }: AppProps) {
  const { exit } = useApp();
  const [state, dispatch] = useReducer(cliReducer, createInitialState(isDemo), init => {
    let s = { ...init, screen: initialScreen };
    if (initialReport) {
      s.report = initialReport;
      s.prIdentity = initialReport.pr;
      s.prUrl = initialReport.pr.url;
      s.runStatus = initialReport.status === "partial" ? "partial" : "ready";
    }
    if (initialScreen === "publish" || initialScreen === "report") {
      s.runStatus = s.report.status === "partial" ? "partial" : "ready";
    } else if (initialScreen === "specialist") {
      s.runStatus = "running";
      s.specialists = s.specialists.map(sp => ({
        ...sp,
        state: "running",
        progress: 10,
        currentActivity: "Analyzing diff hunks against policy...",
      }));
    } else if (initialScreen === "inspection") {
      s.runStatus = "inspecting";
    } else if (initialScreen === "consensus") {
      s.runStatus = "validating";
    }
    if (initialPrUrl) {
      s = cliReducer({ ...s, prUrl: initialPrUrl }, { type: "SUBMIT_PR_URL" });
      if (s.urlError) {
        s = { ...s, screen: "pr_input" };
      }
    }
    return s;
  });

  const handleExit = () => {
    exit();
  };

  useSafeInput((input) => {
    // Global 'q' / 'Q' exit anywhere EXCEPT during PR URL typing
    if ((input === 'q' || input === 'Q') && state.screen !== 'pr_input') {
      exit();
    }
  });

  return (
    <Box flexDirection="column" minHeight={20}>
      <Header
        screen={state.screen}
        prTitle={state.prIdentity.title}
        prNumber={state.prIdentity.number}
        isDemo={state.isDemo}
      />

      <Box flexGrow={1} flexDirection="column">
        {state.screen === "welcome" && (
          <WelcomeScreen
            onStart={() => dispatch({ type: "NAVIGATE", screen: "auth" })}
            onAuthCheck={() => dispatch({ type: "NAVIGATE", screen: "auth" })}
          />
        )}

        {state.screen === "auth" && (
          <AuthScreen
            githubAuth={state.githubAuth}
            codexAuth={state.codexAuth}
            onContinue={() => {
              const isAuthValid = state.githubAuth === "authenticated" && state.codexAuth === "authenticated";
              if (!isAuthValid) {
                dispatch({
                  type: "SET_ERROR",
                  status: "blocked",
                  message: `Preflight authentication blocked: GitHub session is '${state.githubAuth}' and Codex session is '${state.codexAuth}'. Both services must be authenticated before inspecting PRs. Press [T] on the auth screen to cycle credentials.`,
                });
              } else {
                dispatch({ type: "NAVIGATE", screen: "pr_input" });
              }
            }}
            onCycleAuth={() => dispatch({ type: "CYCLE_AUTH_STATE" })}
            onBack={() => dispatch({ type: "NAVIGATE", screen: "welcome" })}
          />
        )}

        {state.screen === "pr_input" && (
          <PrEntryScreen
            prUrl={state.prUrl}
            error={state.urlError}
            onChangeUrl={(url) => dispatch({ type: "SET_PR_URL", url })}
            onSubmit={() => dispatch({ type: "SUBMIT_PR_URL" })}
            onBack={() => dispatch({ type: "NAVIGATE", screen: "auth" })}
          />
        )}

        {state.screen === "inspection" && (
          <InspectScreen
            pr={state.prIdentity}
            onStartAnalysis={() => dispatch({ type: "START_SPECIALISTS" })}
            onBack={() => dispatch({ type: "NAVIGATE", screen: "pr_input" })}
          />
        )}

        {state.screen === "specialist" && (
          <SpecialistScreen
            specialists={state.specialists}
            onComplete={() => dispatch({ type: "FINISH_SPECIALISTS" })}
            onFailLane={(role, reason) => dispatch({ type: "SIMULATE_FAILURE", role, reason })}
            onTimeoutLane={(role, reason) => dispatch({ type: "SPECIALIST_TIMEOUT", role, reason })}
            onSkipLane={(role, reason) => dispatch({ type: "SPECIALIST_SKIP", role, reason })}
            onStepProgress={() => dispatch({ type: "STEP_ALL_PROGRESS" })}
            onCancel={() => dispatch({ type: "CANCEL_RUN" })}
          />
        )}

        {state.screen === "consensus" && (
          <ConsensusScreen
            specialists={state.specialists}
            findings={state.findings}
            onProceed={() => dispatch({ type: "VALIDATE_FINDINGS" })}
            onBack={() => dispatch({ type: "NAVIGATE", screen: "specialist" })}
          />
        )}

        {state.screen === "report" && (
          <ReportScreen
            report={state.report}
            onProceedToPublish={() => dispatch({ type: "NAVIGATE", screen: "publish" })}
            onBack={() => dispatch({ type: "NAVIGATE", screen: "consensus" })}
          />
        )}

        {state.screen === "publish" && (
          <PublishScreen
            report={state.report}
            outcome={state.publishOutcome}
            decision={state.publishDecision}
            onConfirmPublish={() => dispatch({ type: "APPROVE_PUBLISH" })}
            onDenyPublish={() => dispatch({ type: "DENY_PUBLISH" })}
            onToggleStaleSha={() => dispatch({ type: "TRIGGER_STALE_SHA" })}
            onTogglePermissionDenied={() => dispatch({ type: "TRIGGER_PERMISSION_DENIED" })}
            onToggleDuplicate={() => dispatch({ type: "TRIGGER_DUPLICATE" })}
            onBack={() => dispatch({ type: "NAVIGATE", screen: "report" })}
            onRestart={() => dispatch({ type: "RESET" })}
          />
        )}

        {state.screen === "error" && (
          <ErrorScreen
            errorMessage={state.errorMessage}
            onRetry={() => dispatch({ type: "RETRY_RUN" })}
            onExit={handleExit}
          />
        )}
      </Box>

      <Footer />
    </Box>
  );
}
