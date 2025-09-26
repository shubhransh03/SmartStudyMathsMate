import { useState } from 'react';
import { ChevronRight, ChevronDown, Lightbulb, Target, ArrowRight } from 'lucide-react';
import MathFormula from './MathFormula';

interface SolutionStep {
  stepNumber: number;
  title: string;
  explanation: string;
  formula?: string;
  calculation?: string;
  result?: string;
}

interface SolutionMethod {
  methodName: string;
  description: string;
  steps: SolutionStep[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface StepBySolutionProps {
  problem: string;
  methods: SolutionMethod[];
}

const StepBySolution = ({ problem, methods }: StepBySolutionProps) => {
  const [activeMethod, setActiveMethod] = useState(0);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1])); // First step expanded by default

  const toggleStep = (stepNumber: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }
    setExpandedSteps(newExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const currentMethod = methods[activeMethod];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      {/* Problem Statement */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Target className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-800">Problem</h3>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <p className="text-gray-800 font-medium">{problem}</p>
        </div>
      </div>

      {/* Method Selection */}
      {methods.length > 1 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Solution Methods</h4>
          <div className="flex flex-wrap gap-2">
            {methods.map((method, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveMethod(index);
                  setExpandedSteps(new Set([1])); // Reset to first step when changing methods
                }}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                  activeMethod === index
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{method.methodName}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(method.difficulty)}`}>
                    {method.difficulty}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-gray-600 text-sm mt-2">{currentMethod.description}</p>
        </div>
      )}

      {/* Solution Steps */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          <h4 className="text-lg font-semibold text-gray-800">Step-by-Step Solution</h4>
        </div>

        {currentMethod.steps.map((step, index) => (
          <div key={step.stepNumber} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Step Header */}
            <button
              onClick={() => toggleStep(step.stepNumber)}
              className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 flex items-center justify-between transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                  {step.stepNumber}
                </div>
                <span className="font-semibold text-gray-800">{step.title}</span>
              </div>
              {expandedSteps.has(step.stepNumber) ? (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Step Content */}
            {expandedSteps.has(step.stepNumber) && (
              <div className="p-4 bg-white border-t border-gray-100">
                <p className="text-gray-700 mb-3">{step.explanation}</p>
                
                {step.formula && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-600 mb-2">Formula Used:</p>
                    <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                      <MathFormula formula={step.formula} />
                    </div>
                  </div>
                )}

                {step.calculation && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-600 mb-2">Calculation:</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <MathFormula formula={step.calculation} />
                    </div>
                  </div>
                )}

                {step.result && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <ArrowRight className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Result: </span>
                    <MathFormula formula={step.result} inline />
                  </div>
                )}

                {/* Next Step Hint */}
                {index < currentMethod.steps.length - 1 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => toggleStep(currentMethod.steps[index + 1].stepNumber)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                    >
                      <span>Next: {currentMethod.steps[index + 1].title}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Expand All / Collapse All */}
      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={() => setExpandedSteps(new Set(currentMethod.steps.map(s => s.stepNumber)))}
          className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          Expand All Steps
        </button>
        <button
          onClick={() => setExpandedSteps(new Set())}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Collapse All
        </button>
      </div>
    </div>
  );
};

export default StepBySolution;