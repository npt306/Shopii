import React, { useState } from 'react';
import ShopInformationForm from './ShopInformationRegister';
import TaxRegister from './TaxRegister';
import FinalizeRegister from './FinalizeRegister';

// Types
type StepStatus = 'completed' | 'current' | 'upcoming';
type StepId = 'shopInformation' | 'taxRegister' | 'finalize';

interface Step {
    id: StepId;
    label: string;
    status: StepStatus;
}

// Main Component
const ShopRegister = () => {
    const [currentStep, setCurrentStep] = useState<StepId>('shopInformation');

    const steps: Step[] = [
        {
            id: 'shopInformation',
            label: 'Thông tin Shop',
            status: currentStep === 'shopInformation' ? 'current' :
                ['taxRegister', 'finalize'].includes(currentStep) ? 'completed' : 'upcoming'
        },
        {
            id: 'taxRegister',
            label: 'Thông tin thuế',
            status: currentStep === 'taxRegister' ? 'current' :
                currentStep === 'finalize' ? 'completed' : 'upcoming'
        },
        {
            id: 'finalize',
            label: 'Hoàn tất',
            status: currentStep === 'finalize' ? 'current' : 'upcoming'
        }
    ];

    const handleNextStep = () => {
        const currentIndex = steps.findIndex(step => step.id === currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1].id);
        }
    };

    const handlePreviousStep = () => {
        const currentIndex = steps.findIndex(step => step.id === currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1].id);
        }
    };

    // Sub-component for form tracker
    const FormProgressTracker = () => {
        return (
            <div className="w-full py-6">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            {/* Step circle with number */}
                            <div className="relative flex flex-col items-center">
                                <button
                                    onClick={() => setCurrentStep(step.id)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-medium text-sm focus:outline-none transition-colors duration-300 ${
                                        step.status === 'completed'
                                            ? 'bg-red-500 border-red-500 text-white'
                                            : step.status === 'current'
                                                ? 'border-red-500 bg-red-500 text-white'
                                                : 'border-gray-300 bg-gray-200 text-gray-400'
                                    }`}
                                >
                                    {step.status === 'completed' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        ''
                                    )}
                                </button>

                                {/* Step label */}
                                <div className="text-xs font-medium mt-2 text-center w-28">
                                    <span className={`${step.status === 'completed'
                                        ? 'text-black'
                                        : step.status === 'current'
                                            ? 'text-black font-semibold'
                                            : 'text-gray-500'
                                        }`}>
                                        {step.label}
                                    </span>
                                </div>
                            </div>

                            {/* Connector line between steps */}
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-px mx-2 ${steps[index + 1].status === 'upcoming' && step.status === 'upcoming' ? 'bg-gray-300' :
                                    steps[index + 1].status === 'upcoming' && step.status !== 'upcoming' ? 'bg-gray-300' :
                                        step.status === 'completed' ? 'bg-gray-300' : 'bg-gray-300'
                                    }`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    // Render the appropriate form based on current step
    const renderForm = () => {
        switch (currentStep) {
            case 'shopInformation':
                return <ShopInformationForm onNextStep={handleNextStep} />;
            case 'taxRegister':
                return <TaxRegister onNextStep={handleNextStep} onPreviousStep={handlePreviousStep} />;
            case 'finalize':
                return <FinalizeRegister onNextStep={handleNextStep}/>;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white text-black w-full max-w-4xl mx-auto">
            <FormProgressTracker />
            <div className="mt-2 mb-6 border-t border-gray-200"></div>
            {renderForm()}
            <div className="h-20"></div>
        </div>
    );
};

export default ShopRegister;
