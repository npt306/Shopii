import React, { useState } from 'react';
import ShopInformationForm from './ShopInformationRegister';
import TaxRegister from './TaxRegister';
import FinalizeRegister from './FinalizeRegister';
import axios from 'axios';

type Step = 'shopInformation' | 'taxRegister' | 'finalize';

interface FormData {
  shopInformation: {
    shopName: string;
    email: string;
    phone: string;
    // other shop info fields...
    // You can also include address info here if needed.
  };
  taxRegister: {
    businessType: string;
    businessAddress: string;
    email: string;
    taxCode: string;
  };
}

const ShopRegister = () => {
  const [currentStep, setCurrentStep] = useState<Step>('shopInformation');
  const [formData, setFormData] = useState<FormData>({
    shopInformation: {
      shopName: '',
      email: '',
      phone: '',
    },
    taxRegister: {
      businessType: '',
      businessAddress: '',
      email: '',
      taxCode: '',
    },
  });

  // Callback to update shop information data
  const handleShopInformationUpdate = (data: FormData['shopInformation']) => {
    setFormData(prev => ({
      ...prev,
      shopInformation: data,
    }));
    setCurrentStep('taxRegister');
  };

  // Callback to update tax register data
  const handleTaxRegisterUpdate = (data: FormData['taxRegister']) => {
    setFormData(prev => ({
      ...prev,
      taxRegister: data,
    }));
    setCurrentStep('finalize');
  };

  // Final submission: Gather and process all data
  const handleFinalSubmit = async () => {
    try {
      const response = await axios.post('/register-shop', formData);
      console.log('Response from server:', response.data);
      // Handle success
    } catch (error: any) {
      console.error('Error submitting form:', error.response?.data || error.message);
      // Handle error
    }
  };

  // Compute steps with statuses based on currentStep
  const steps = [
    {
      id: 'shopInformation',
      label: 'Thông tin shop',
      status: currentStep === 'shopInformation' ? 'current' : 'completed',
    },
    {
      id: 'taxRegister',
      label: 'Thông tin thuế',
      status: currentStep === 'taxRegister'
        ? 'current'
        : currentStep === 'shopInformation'
          ? 'upcoming'
          : 'completed',
    },
    {
      id: 'finalize',
      label: 'Hoàn tất',
      status: currentStep === 'finalize' ? 'current' : 'upcoming',
    },
  ];

  // Sub-component for form progress tracker
  const FormProgressTracker = () => {
    return (
      <div className="w-full py-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step circle with icon or number */}
              <div className="relative flex flex-col items-center">
                <button
                  onClick={() => setCurrentStep(step.id as Step)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-medium text-sm focus:outline-none transition-colors duration-300 ${
                    step.status === 'completed'
                      ? 'bg-red-500 border-red-500 text-white'
                      : step.status === 'current'
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'border-gray-300 bg-gray-200 text-gray-400'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    ''
                  )}
                </button>

                {/* Step label */}
                <div className="text-xs font-medium mt-2 text-center w-28">
                  <span
                    className={`${
                      step.status === 'completed'
                        ? 'text-black'
                        : step.status === 'current'
                        ? 'text-black font-semibold'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </div>

              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 ${
                    steps[index + 1].status === 'upcoming' && step.status === 'upcoming'
                      ? 'bg-gray-300'
                      : 'bg-gray-300'
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderForm = () => {
    switch (currentStep) {
      case 'shopInformation':
        return (
          <ShopInformationForm
            initialData={formData.shopInformation}
            onNextStep={handleShopInformationUpdate}
          />
        );
      case 'taxRegister':
        return (
          <TaxRegister
            initialData={formData.taxRegister}
            onNextStep={handleTaxRegisterUpdate}
            onPreviousStep={() => setCurrentStep('shopInformation')}
          />
        );
      case 'finalize':
        return <FinalizeRegister onSubmit={handleFinalSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white text-black w-full max-w-4xl mx-auto">
      {/* Render progress tracker at the top */}
      <FormProgressTracker />
      <div className="mt-2 mb-6 border-t border-gray-200"></div>
      {renderForm()}
      <div className="h-20"></div>
    </div>
  );
};

export default ShopRegister;
