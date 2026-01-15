import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Heart,
  Coffee,
  Target,
  ArrowRight,
  Loader2
} from 'lucide-react';

// ===== TYPES =====

interface UnstuckSession {
  timestamp: string;
  state: string;
  customState?: string;
  neededDeeperDig: boolean;
  deeperDigType?: string;
  deeperDigResponse?: string;
  connectedTo?: string;
  smallestStep?: string;
  note?: string;
}

type Step = 'pause' | 'fork' | 'dig' | 'connect' | 'capture' | 'release';

// ===== CONSTANTS =====

const EMOTIONS = [
  { value: 'scattered', label: 'Scattered', desc: 'mind jumping between things' },
  { value: 'avoiding', label: 'Avoiding', desc: 'procrastinating on something' },
  { value: 'overwhelmed', label: 'Overwhelmed', desc: 'too much to do' },
  { value: 'bored', label: 'Bored', desc: 'nothing feels interesting' },
  { value: 'anxious', label: 'Anxious', desc: 'worried about something' },
  { value: 'unclear', label: 'Unclear', desc: 'don\'t know what to do next' },
  { value: 'tired', label: 'Tired', desc: 'low energy' },
  { value: 'custom', label: 'Something else...', desc: '' },
];

const DEEPER_DIG_PROMPTS = [
  { value: 'protecting', label: 'What might I be protecting myself from?' },
  { value: 'body', label: 'Where do I feel this in my body?' },
  { value: 'bypass', label: 'What would I do if this feeling wasn\'t in the way?' },
];

// ===== MAIN COMPONENT =====

export const UnstuckPage: React.FC<{ onNavigate?: (page: string) => void }> = () => {
  // Session state
  const [currentStep, setCurrentStep] = useState<Step>('pause');
  const [session, setSession] = useState<Partial<UnstuckSession>>({
    timestamp: new Date().toISOString(),
    neededDeeperDig: false,
  });

  // API state
  const [priorities, setPriorities] = useState<string[]>([]);
  const [loadingPriorities, setLoadingPriorities] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  // Completed steps (for collapse UI)
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());

  // Fetch priorities when reaching connect step
  useEffect(() => {
    if (currentStep === 'connect' && priorities.length === 0) {
      setLoadingPriorities(true);
      fetch('/api/unstuck/goals')
        .then(res => res.json())
        .then(data => setPriorities(data.priorities || []))
        .catch(err => console.error('Failed to load priorities:', err))
        .finally(() => setLoadingPriorities(false));
    }
  }, [currentStep]);

  // Step completion handlers
  const completeStep = (step: Step) => {
    setCompletedSteps(prev => new Set(prev).add(step));
  };

  const handlePauseComplete = (emotion: string, customText?: string) => {
    setSession(prev => ({
      ...prev,
      state: emotion,
      customState: emotion === 'custom' ? customText : undefined,
    }));
    completeStep('pause');
    setCurrentStep('fork');
  };

  const handleForkChoice = (choice: 'yes' | 'no' | 'rest') => {
    if (choice === 'rest') {
      setSession(prev => ({ ...prev, note: 'Recognized need for rest' }));
      completeStep('fork');
      setCurrentStep('release');
      logSession({ ...session, note: 'Recognized need for rest' } as UnstuckSession);
    } else if (choice === 'no') {
      setSession(prev => ({ ...prev, neededDeeperDig: true }));
      completeStep('fork');
      setCurrentStep('dig');
    } else {
      completeStep('fork');
      setCurrentStep('connect');
    }
  };

  const handleDigComplete = (digType: string, response: string, smallestStep?: string) => {
    setSession(prev => ({
      ...prev,
      deeperDigType: digType,
      deeperDigResponse: response,
      smallestStep,
    }));
    completeStep('dig');
    setCurrentStep('connect');
  };

  const handleConnectComplete = (priority: string | null) => {
    setSession(prev => ({
      ...prev,
      connectedTo: priority || undefined,
    }));
    completeStep('connect');
    setCurrentStep('capture');
  };

  const handleCaptureComplete = (note?: string) => {
    const finalSession = { ...session, note } as UnstuckSession;
    setSession(finalSession);
    completeStep('capture');
    setCurrentStep('release');
    logSession(finalSession);
  };

  const logSession = async (sessionData: UnstuckSession) => {
    setIsLogging(true);
    try {
      await fetch('/api/unstuck/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
    } catch (err) {
      console.error('Failed to log session:', err);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-32">
      <div className="max-w-2xl mx-auto px-6 sm:px-8">

        {/* HEADER */}
        <header className="pt-24 pb-16">
          <div className="flex items-center gap-2 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100">
              <Heart className="w-3 h-3 text-rose-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Focus Ritual</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-serif font-medium tracking-tight mb-4 text-black">
            Unstuck
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-xl leading-relaxed">
            Reconnect with what matters. Break the distraction loop.
          </p>
        </header>

        {/* STEP 1: PAUSE */}
        <PauseStep
          active={currentStep === 'pause'}
          completed={completedSteps.has('pause')}
          selectedEmotion={session.state}
          customText={session.customState}
          onComplete={handlePauseComplete}
        />

        {/* STEP 2: FORK */}
        {(currentStep === 'fork' || completedSteps.has('fork') || currentStep === 'dig' || currentStep === 'connect' || currentStep === 'capture' || currentStep === 'release') && (
          <ForkStep
            active={currentStep === 'fork'}
            completed={completedSteps.has('fork')}
            neededDeeperDig={session.neededDeeperDig}
            onChoice={handleForkChoice}
          />
        )}

        {/* STEP 3: DIG DEEPER (conditional) */}
        {session.neededDeeperDig && (currentStep === 'dig' || completedSteps.has('dig') || currentStep === 'connect' || currentStep === 'capture' || currentStep === 'release') && (
          <DigDeeperStep
            active={currentStep === 'dig'}
            completed={completedSteps.has('dig')}
            digType={session.deeperDigType}
            response={session.deeperDigResponse}
            smallestStep={session.smallestStep}
            onComplete={handleDigComplete}
          />
        )}

        {/* STEP 4: CONNECT */}
        {(currentStep === 'connect' || completedSteps.has('connect') || currentStep === 'capture' || currentStep === 'release') && (
          <ConnectStep
            active={currentStep === 'connect'}
            completed={completedSteps.has('connect')}
            priorities={priorities}
            loading={loadingPriorities}
            connectedTo={session.connectedTo}
            onComplete={handleConnectComplete}
          />
        )}

        {/* STEP 5: CAPTURE */}
        {(currentStep === 'capture' || completedSteps.has('capture') || currentStep === 'release') && (
          <CaptureStep
            active={currentStep === 'capture'}
            completed={completedSteps.has('capture')}
            note={session.note}
            onComplete={handleCaptureComplete}
          />
        )}

        {/* STEP 6: RELEASE */}
        {currentStep === 'release' && (
          <ReleaseStep isLogging={isLogging} />
        )}

      </div>
    </div>
  );
};

// ===== STEP COMPONENTS =====

const StepContainer: React.FC<{
  stepNumber: number;
  title: string;
  active: boolean;
  completed: boolean;
  children: React.ReactNode;
}> = ({ stepNumber, title, active, completed, children }) => {
  if (completed && !active) {
    return (
      <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-default group hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-bold text-gray-600">
            Step {stepNumber}: {title}
          </span>
        </div>
      </div>
    );
  }

  return (
    <section className="mb-12">
      <div className={`p-8 rounded-3xl border-2 transition-all duration-300 ${
        active
          ? 'border-black bg-white shadow-xl'
          : 'border-gray-100 bg-gray-50'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
            active ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {stepNumber}
          </div>
          <h2 className="text-xl font-bold font-serif text-gray-900">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
};

const PauseStep: React.FC<{
  active: boolean;
  completed: boolean;
  selectedEmotion?: string;
  customText?: string;
  onComplete: (emotion: string, customText?: string) => void;
}> = ({ active, completed, selectedEmotion, customText, onComplete }) => {
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSelect = (emotion: string) => {
    if (emotion === 'custom') {
      setShowCustomInput(true);
    } else {
      onComplete(emotion);
    }
  };

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      onComplete('custom', customInput.trim());
    }
  };

  return (
    <StepContainer stepNumber={1} title="Pause" active={active} completed={completed}>
      {completed && selectedEmotion ? (
        <p className="text-gray-600 font-medium">
          Selected: <span className="text-black font-bold">{selectedEmotion}</span>
          {customText && ` (${customText})`}
        </p>
      ) : (
        <>
          <p className="text-gray-500 mb-6 font-medium">What's happening right now?</p>

          <div className="grid grid-cols-2 gap-3">
            {EMOTIONS.map(emotion => (
              <button
                key={emotion.value}
                onClick={() => handleSelect(emotion.value)}
                className="p-4 rounded-xl border-2 border-gray-100 hover:border-black hover:bg-gray-50 transition-all text-left group"
              >
                <div className="font-bold text-gray-900 mb-1">{emotion.label}</div>
                {emotion.desc && (
                  <div className="text-xs text-gray-400 group-hover:text-gray-600">{emotion.desc}</div>
                )}
              </button>
            ))}
          </div>

          {showCustomInput && (
            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
                placeholder="Describe what you're feeling..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-colors font-medium"
                autoFocus
              />
              <button
                onClick={handleCustomSubmit}
                disabled={!customInput.trim()}
                className="w-full px-4 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
              >
                Continue
              </button>
            </div>
          )}
        </>
      )}
    </StepContainer>
  );
};

const ForkStep: React.FC<{
  active: boolean;
  completed: boolean;
  neededDeeperDig?: boolean;
  onChoice: (choice: 'yes' | 'no' | 'rest') => void;
}> = ({ active, completed, neededDeeperDig, onChoice }) => {
  return (
    <StepContainer stepNumber={2} title="Fork" active={active} completed={completed}>
      {completed ? (
        <p className="text-gray-600 font-medium">
          {neededDeeperDig ? 'Chose to dig deeper' : 'Naming it helped'}
        </p>
      ) : (
        <>
          <p className="text-gray-500 mb-6 font-medium">Did naming it help?</p>

          <div className="space-y-3">
            <button
              onClick={() => onChoice('yes')}
              className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-black hover:bg-gray-50 transition-all text-left group flex items-center justify-between"
            >
              <span className="font-bold text-gray-900">Yes - show me my goals</span>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
            </button>

            <button
              onClick={() => onChoice('no')}
              className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-black hover:bg-gray-50 transition-all text-left group flex items-center justify-between"
            >
              <span className="font-bold text-gray-900">No - I need to dig deeper</span>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
            </button>

            <button
              onClick={() => onChoice('rest')}
              className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-rose-200 hover:bg-rose-50 transition-all text-left group flex items-center justify-between"
            >
              <span className="font-bold text-gray-900">Actually, I think I need rest</span>
              <Coffee className="w-5 h-5 text-gray-300 group-hover:text-rose-500 transition-colors" />
            </button>
          </div>
        </>
      )}
    </StepContainer>
  );
};

const DigDeeperStep: React.FC<{
  active: boolean;
  completed: boolean;
  digType?: string;
  response?: string;
  smallestStep?: string;
  onComplete: (digType: string, response: string, smallestStep?: string) => void;
}> = ({ active, completed, digType, response, smallestStep, onComplete }) => {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [stepText, setStepText] = useState('');
  const [showStepInput, setShowStepInput] = useState(false);

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
  };

  const handleResponseSubmit = () => {
    if (responseText.trim()) {
      setShowStepInput(true);
    }
  };

  const handleFinalSubmit = () => {
    if (selectedPrompt && responseText.trim()) {
      onComplete(selectedPrompt, responseText.trim(), stepText.trim() || undefined);
    }
  };

  return (
    <StepContainer stepNumber={3} title="Dig Deeper" active={active} completed={completed}>
      {completed && digType ? (
        <div className="space-y-2 text-sm">
          <p className="text-gray-600">
            <span className="font-bold">Prompt:</span> {DEEPER_DIG_PROMPTS.find(p => p.value === digType)?.label}
          </p>
          <p className="text-gray-600">
            <span className="font-bold">Response:</span> {response}
          </p>
          {smallestStep && (
            <p className="text-gray-600">
              <span className="font-bold">Smallest step:</span> {smallestStep}
            </p>
          )}
        </div>
      ) : (
        <>
          {!selectedPrompt ? (
            <>
              <p className="text-gray-500 mb-6 font-medium">What might help?</p>
              <div className="space-y-3">
                {DEEPER_DIG_PROMPTS.map(prompt => (
                  <button
                    key={prompt.value}
                    onClick={() => handlePromptSelect(prompt.value)}
                    className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-black hover:bg-gray-50 transition-all text-left"
                  >
                    <span className="font-bold text-gray-900">{prompt.label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : !showStepInput ? (
            <>
              <p className="text-gray-500 mb-4 font-medium">
                {DEEPER_DIG_PROMPTS.find(p => p.value === selectedPrompt)?.label}
              </p>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Take your time..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-colors font-medium min-h-[120px] resize-none"
                autoFocus
              />
              <button
                onClick={handleResponseSubmit}
                disabled={!responseText.trim()}
                className="mt-3 w-full px-4 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-4 font-medium">
                What's the smallest step you could take? (5 min or less)
              </p>
              <input
                type="text"
                value={stepText}
                onChange={(e) => setStepText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFinalSubmit()}
                placeholder="e.g., open the document, write one sentence"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-colors font-medium"
                autoFocus
              />
              <button
                onClick={handleFinalSubmit}
                className="mt-3 w-full px-4 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-colors"
              >
                Continue
              </button>
            </>
          )}
        </>
      )}
    </StepContainer>
  );
};

const ConnectStep: React.FC<{
  active: boolean;
  completed: boolean;
  priorities: string[];
  loading: boolean;
  connectedTo?: string;
  onComplete: (priority: string | null) => void;
}> = ({ active, completed, priorities, loading, connectedTo, onComplete }) => {
  return (
    <StepContainer stepNumber={4} title="Connect" active={active} completed={completed}>
      {completed && connectedTo ? (
        <p className="text-gray-600 font-medium">
          Connected to: <span className="text-black font-bold">{connectedTo}</span>
        </p>
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <p className="text-gray-500 mb-6 font-medium">Which of these feels alive right now?</p>

          <div className="space-y-3">
            {priorities.map((priority, i) => (
              <button
                key={i}
                onClick={() => onComplete(priority)}
                className="w-full p-6 rounded-2xl border border-gray-100 hover:border-black hover:shadow-xl transition-all group text-left"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-serif text-gray-900">{priority}</h3>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors opacity-0 group-hover:opacity-100" />
                </div>
              </button>
            ))}

            <button
              onClick={() => onComplete(null)}
              className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all text-center"
            >
              <span className="text-sm font-bold text-gray-400 hover:text-gray-600">Nothing resonates right now</span>
            </button>
          </div>
        </>
      )}
    </StepContainer>
  );
};

const CaptureStep: React.FC<{
  active: boolean;
  completed: boolean;
  note?: string;
  onComplete: (note?: string) => void;
}> = ({ active, completed, note, onComplete }) => {
  const [noteText, setNoteText] = useState('');

  return (
    <StepContainer stepNumber={5} title="Capture" active={active} completed={completed}>
      {completed && note ? (
        <p className="text-gray-600 font-medium italic">"{note}"</p>
      ) : (
        <>
          <p className="text-gray-500 mb-4 font-medium">
            What reconnected you? (brief note for your future self)
          </p>
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onComplete(noteText.trim() || undefined)}
            placeholder="optional - press enter to skip"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none transition-colors font-medium"
            autoFocus
          />
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => onComplete(noteText.trim() || undefined)}
              className="flex-1 px-4 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-colors"
            >
              {noteText.trim() ? 'Save & Continue' : 'Skip'}
            </button>
          </div>
        </>
      )}
    </StepContainer>
  );
};

const ReleaseStep: React.FC<{ isLogging: boolean }> = ({ isLogging }) => {
  return (
    <section className="mb-12">
      <div className="p-12 rounded-3xl border-2 border-emerald-200 bg-emerald-50 text-center">
        {isLogging ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-emerald-700 font-medium">Logging session...</p>
          </div>
        ) : (
          <>
            <Target className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold font-serif text-emerald-900 mb-3">You're clear.</h2>
            <p className="text-emerald-700 font-medium text-lg mb-6">Session logged. Go.</p>
            <button
              onClick={() => window.close()}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
            >
              Close
            </button>
          </>
        )}
      </div>
    </section>
  );
};
