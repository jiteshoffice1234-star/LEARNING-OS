import { useState } from 'react';
import { Target, ArrowRight, ArrowLeft, Sparkles, BookOpen, GraduationCap, Briefcase, Clock, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: "What's your name?",
    subtitle: "We'll use this to personalize your experience",
    icon: Sparkles,
    type: 'text' as const,
    placeholder: 'Enter your preferred name',
    key: 'name',
  },
  {
    id: 2,
    title: 'Current education level?',
    subtitle: 'Where are you in your academic journey',
    icon: GraduationCap,
    type: 'select' as const,
    options: ['High School', 'Undergraduate', 'Postgraduate', 'Professional', 'Self-taught', 'Other'],
    key: 'education',
  },
  {
    id: 3,
    title: 'What are you focusing on?',
    subtitle: 'Your primary area of study or work',
    icon: BookOpen,
    type: 'select' as const,
    options: ['Computer Science', 'Data Science', 'Business', 'Design', 'Engineering', 'Medicine', 'Other'],
    key: 'focus',
  },
  {
    id: 4,
    title: 'Current situation?',
    subtitle: 'What best describes where you are now',
    icon: Briefcase,
    type: 'select' as const,
    options: ['Student', 'Working Professional', 'Freelancer', 'Job Seeker', 'Entrepreneur', 'Career Switcher'],
    key: 'situation',
  },
  {
    id: 5,
    title: 'Main development goal?',
    subtitle: 'What do you want to achieve',
    icon: Target,
    type: 'select' as const,
    options: ['Academic Excellence', 'Career Advancement', 'Skill Mastery', 'Certification', 'Personal Growth', 'Multiple Goals'],
    key: 'goal',
  },
  {
    id: 6,
    title: 'Daily learning time?',
    subtitle: 'How much time can you commit each day',
    icon: Clock,
    type: 'select' as const,
    options: ['30 minutes', '1 hour', '2 hours', '3 hours', '4+ hours', 'Flexible'],
    key: 'time',
  },
];

export default function Welcome({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const step = steps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [step.key]: value });
  };

  const canProceed = step.type === 'text' 
    ? (answers[step.key] || '').length > 0 
    : !!answers[step.key];

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-xs text-primary font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-elevated rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-primary' : 'bg-elevated'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 animate-fade-in">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-6">
            <Icon className="w-7 h-7 text-primary" />
          </div>

          {/* Question */}
          <h1 className="text-2xl font-bold text-text mb-2">{step.title}</h1>
          <p className="text-sm text-muted mb-8">{step.subtitle}</p>

          {/* Input */}
          {step.type === 'text' ? (
            <input
              type="text"
              placeholder={step.placeholder}
              value={answers[step.key] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canProceed && handleNext()}
              autoFocus
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {step.options?.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    answers[step.key] === option
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-elevated text-text hover:bg-elevated/80 border border-border/50'
                  }`}
                >
                  {answers[step.key] === option && <Check className="w-3 h-3 inline mr-1.5" />}
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/25"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Branding */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
              <Target className="w-3 h-3 text-primary" />
            </div>
            <span className="text-sm font-bold gradient-text">LEARNING OS</span>
          </div>
          <p className="text-xs text-muted">Your learning journey deserves a system.</p>
        </div>
      </div>
    </div>
  );
}
