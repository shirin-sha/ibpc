import Link from "next/link";
import { useState, memo, useMemo, useCallback, useEffect } from "react";
import { FormInput, FormSelect, PhotoUpload } from "./FormComponents";
import IndustrySectorSelect from "./IndustrySectorSelect";
import { usePerformanceMonitor } from "@/lib/performanceMonitor";

const steps = [
  { number: "1", title: "Personal & Business Info", icon: "👤" },
  { number: "2", title: "Identification Details", icon: "🪪" },
  { number: "3", title: "Contact Information", icon: "📞" },
  { number: "4", title: "Application Details", icon: "📝" },
  { number: "5", title: "Sponsorship", icon: "🤝" },
  { number: "6", title: "Declaration", icon: "✅" }
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegistrationStepper({ onComplete }) {
  const [step, setStep] = useState(0);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Performance monitoring
  const { measureRender, measureApiCall } = usePerformanceMonitor('RegistrationStepper');

  const [form, setForm] = useState({
    name: "",
    companyName: "",
    profession: "",
    businessActivity: "",
    sponsorName: "",
    passportNumber: "",
    civilId: "",
    address: "",
    officePhone: "",
    mobile: "",
    email: "",
    benefit: "",
    contribution: "",
    proposer1: "",
    proposer2: "",
    photo: null,
    consent: false,
    industrySector: "",
    alternateIndustrySector: "",
    companyAddress: "",
    companyWebsite: "",
    alternateMobile: "",
    alternateEmail: "",
    nationality: "",
    membershipType: "",
  });

  // Optimized photo handling
  const handlePhotoChange = useCallback((file) => {
    setForm(prev => ({ ...prev, photo: file }));
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handlePhotoRemove = useCallback(() => {
    setForm(prev => ({ ...prev, photo: null }));
    setPhotoPreview(null);
  }, []);

  // Validation for each step
  const isStepValid = useCallback(() => {
    switch (step) {
      case 0:
        return (
          form.name.trim() &&
          form.profession.trim() &&
          form.companyName.trim() &&
          form.nationality &&
          form.membershipType
        );
      case 1:
        return true;
      case 2:
        return (
          form.mobile.trim() &&
          form.email.trim() &&
          emailRegex.test(form.email)
        );
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return form.consent;
      default:
        return false;
    }
  }, [step, form]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }, []);

  const nextStep = useCallback(() => setStep(s => Math.min(s + 1, steps.length - 1)), []);
  const prevStep = useCallback(() => setStep(s => Math.max(s - 1, 0)), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const endMeasure = measureRender();

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'photo' && form[key]) formData.append('photo', form[key]);
        else if (key !== 'photo') formData.append(key, form[key]);
      });

      const response = await measureApiCall(
        () => fetch('/api/register', { method: 'POST', body: formData }),
        'Registration API'
      );
      
      const result = await response.json();

      if (response.ok) {
        if (typeof onComplete === 'function') {
          onComplete();
        }
        setForm({
          name: "", companyName: "", profession: "", businessActivity: "",
          sponsorName: "", passportNumber: "", civilId: "", address: "",
          officePhone: "", mobile: "", email: "",
          benefit: "", contribution: "", proposer1: "", proposer2: "",
          photo: null, consent: false,
          industrySector: "", alternateIndustrySector: "", companyAddress: "", companyWebsite: "",
          alternateMobile: "", alternateEmail: "",
          nationality: "", membershipType: "",
        });
        setPhotoPreview(null);
        setStep(0);
      } else throw new Error(result.message || 'Submission failed');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting registration: ' + error.message);
    } finally {
      setIsSubmitting(false);
      endMeasure();
    }
  };

  // Memoize current step content
  const currentStepContent = useMemo(() => {
    switch(step) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal & Business Information</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <FormInput
                name="name"
                value={form.name}
                onChange={handleChange}
                id="name"
                label="Full Name"
                placeholder="Full Name"
                required
              />
              <FormInput
                name="profession"
                value={form.profession}
                onChange={handleChange}
                id="profession"
                label="Profession & Designation"
                placeholder="Profession & Designation"
                required
              />
              <FormInput
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                id="companyName"
                label="Company Name"
                placeholder="Company Name"
                required
              />
              <FormInput
                name="companyAddress"
                value={form.companyAddress}
                onChange={handleChange}
                id="companyAddress"
                label="Company Address"
                placeholder="Company Address"
              />
              <FormInput
                name="companyWebsite"
                value={form.companyWebsite}
                onChange={handleChange}
                id="companyWebsite"
                label="Company Website"
                placeholder="Company Website"
              />
              <FormInput
                name="businessActivity"
                value={form.businessActivity}
                onChange={handleChange}
                id="businessActivity"
                label="Business Activity Type"
                placeholder="Business Activity Type"
              />
              <IndustrySectorSelect
                name="industrySector"
                value={form.industrySector}
                onChange={handleChange}
                id="industrySector"
                label="Industry Sector"
                placeholder="Select Industry Sector"
              />
              <IndustrySectorSelect
                name="alternateIndustrySector"
                value={form.alternateIndustrySector}
                onChange={handleChange}
                id="alternateIndustrySector"
                label="Alternate Industry Sector (optional)"
                placeholder="Select Alternate Industry Sector (optional)"
              />
              <FormInput
                name="sponsorName"
                value={form.sponsorName}
                onChange={handleChange}
                id="sponsorName"
                label="Kuwaiti Sponsor/Partner Name"
                placeholder="Kuwaiti Sponsor/Partner Name"
              />
              <FormSelect
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                id="nationality"
                label="Nationality"
                required
              >
                <option value="">Select Nationality</option>
                <option value="INDIAN">INDIAN</option>
                <option value="OCI CARD HOLDER">OCI CARD HOLDER</option>
                <option value="OTHERS">OTHERS</option>
              </FormSelect>
              <FormSelect
                name="membershipType"
                value={form.membershipType}
                onChange={handleChange}
                id="membershipType"
                label="Membership Type"
                required
              >
                <option value="">Select Membership Type</option>
                <option value="Individual Member">Individual Member</option>
                <option value="Corporate Member">Corporate Member</option>
                <option value="Special Honorary Member">Special Honorary Member</option>
                <option value="Honorary Member">Honorary Member</option>
              </FormSelect>
              <PhotoUpload
                photoPreview={photoPreview}
                onChange={handlePhotoChange}
                onRemove={handlePhotoRemove}
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Identification Details</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <FormInput
                name="passportNumber"
                value={form.passportNumber}
                onChange={handleChange}
                id="passportNumber"
                label="Indian Passport Number"
                placeholder="Indian Passport Number"
              />
              <FormInput
                name="civilId"
                value={form.civilId}
                onChange={handleChange}
                id="civilId"
                label="Kuwait Civil ID Number"
                placeholder="Kuwait Civil ID Number"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <FormInput
              name="address"
              value={form.address}
              onChange={handleChange}
              id="address"
              label="Address in Kuwait"
              placeholder="Address in Kuwait"
              rows={2}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <FormInput
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                id="mobile"
                label="Mobile"
                placeholder="Mobile"
                required
              />
              <FormInput
                type="tel"
                name="officePhone"
                value={form.officePhone}
                onChange={handleChange}
                id="officePhone"
                label="Office Phone"
                placeholder="Office Phone"
              />
            </div>
            <FormInput
              type="tel"
              name="alternateMobile"
              value={form.alternateMobile}
              onChange={handleChange}
              id="alternateMobile"
              label="Alternate Mobile (optional)"
              placeholder="Alternate Mobile (optional)"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <FormInput
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                id="email"
                label="Email Address"
                placeholder="Email Address"
                required
              />
              <FormInput
                type="email"
                name="alternateEmail"
                value={form.alternateEmail}
                onChange={handleChange}
                id="alternateEmail"
                label="Alternate Email (optional)"
                placeholder="Alternate Email (optional)"
              />
            </div>
            {form.email && !emailRegex.test(form.email) && (
              <span className="text-xs" style={{ color: '#061E3E' }}>Please enter a valid email address.</span>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details (Optional)</h2>
            <div className="grid gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How would you benefit from IBPC membership?</label>
                <FormInput
                  name="benefit"
                  value={form.benefit}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How can you contribute to IBPC's objectives?</label>
                <FormInput
                  name="contribution"
                  value={form.contribution}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sponsorship</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <FormInput
                name="proposer1"
                value={form.proposer1}
                onChange={handleChange}
                id="proposer1"
                label="First IBPC Member Proposer"
                placeholder="First IBPC Member Proposer"
              />
              <FormInput
                name="proposer2"
                value={form.proposer2}
                onChange={handleChange}
                id="proposer2"
                label="Second IBPC Member Proposer"
                placeholder="Second IBPC Member Proposer"
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Declaration</h2>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  I hereby declare that all information provided is true and accurate.
                  I agree to abide by the rules and regulations of IBPC.
                </p>
              </div>
              <label className="flex items-center space-x-3">
                <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} className="h-4 w-4 border-gray-300 rounded" style={{ accentColor: '#061E3E' }} required />
                <span className="text-sm text-gray-600">
                  I accept the terms and conditions and consent to the processing of my information according to IBPC's privacy policy.
                </span>
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [step, form, handleChange, photoPreview, handlePhotoChange, handlePhotoRemove]);

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10">
      {/* Heading */}
      <h1 className="text-black text-2xl font-bold text-center flex-grow mx-2 mb-8">
        Register for IBPC Membership
      </h1>

      {/* Stepper UI */}
      <div className="mb-4">
        {/* Desktop Stepper */}
        <div className="hidden md:block relative">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[calc(100%-100px)] h-0.5 bg-gray-200">
            <div className="h-full transition-all duration-300" style={{ width: `${(step / (steps.length - 1)) * 100}%`, backgroundColor: '#061E3E' }} />
          </div>
          <div className="relative flex justify-between">
            {steps.map((item, idx) => {
              const isActive = idx === step;
              const isComplete = idx < step;

              return (
                <div key={idx} className="flex flex-col items-center z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isComplete ? "text-white" : isActive ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-500"}`} style={isComplete ? { backgroundColor: '#061E3E' } : {}}>
                    {isComplete ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs font-medium">{idx + 1}</span>
                    )}
                  </div>
                  <span className="mt-1 text-xs font-medium text-gray-500 text-center">{item.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Stepper */}
        <div className="md:hidden flex items-center justify-between px-2">
          <span className="text-sm font-medium text-gray-500">Step {step + 1} of {steps.length}</span>
          <span className="text-sm font-medium text-gray-900">{steps[step].title}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl px-10 py-4 md:px-12 md:py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentStepContent}

          <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 mt-6 border-t gap-2">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 0}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-sm"
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`w-full sm:w-auto px-4 py-2 text-white rounded-lg transition-colors text-sm ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                style={{ backgroundColor: '#061E3E' }}
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isStepValid() || isSubmitting}
                className="w-full sm:w-auto px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 text-sm hover:opacity-90"
                style={{ backgroundColor: '#061E3E' }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm md:text-base text-gray-700">
         Already a member?{" "}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: '#061E3E' }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default memo(RegistrationStepper);
