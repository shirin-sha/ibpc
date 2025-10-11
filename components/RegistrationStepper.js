import Link from "next/link";
import { useState, memo, useMemo, useCallback } from "react";
import { INDUSTRY_SECTORS } from "@/lib/industrySectors";

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

  // Memoized input class
  const inputClass = useMemo(() => 
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-400 text-gray-900",
    []
  );

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
    const { name, value, type, checked, files } = e.target;

    if (name === 'photo' && files && files[0]) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      setForm(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  }, []);

  const removePhoto = useCallback(() => {
    setForm(prev => ({ ...prev, photo: null }));
    setPhotoPreview(null);
  }, []);

  const nextStep = useCallback(() => setStep(s => Math.min(s + 1, steps.length - 1)), []);
  const prevStep = useCallback(() => setStep(s => Math.max(s - 1, 0)), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'photo' && form[key]) formData.append('photo', form[key]);
        else if (key !== 'photo') formData.append(key, form[key]);
      });

      const response = await fetch('/api/register', { method: 'POST', body: formData });
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
              <div className="relative">
                <input type="text" name="name" value={form.name} onChange={handleChange} id="name" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="Full Name" required />
                <label htmlFor="name" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">
                  Full Name <span style={{ color: '#061E3E' }}>*</span>
                </label>
              </div>
              <div className="relative">
                <input type="text" name="profession" value={form.profession} onChange={handleChange} id="profession" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="Profession & Designation" required />
                <label htmlFor="profession" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">
                  Profession & Designation <span style={{ color: '#061E3E' }}>*</span>
                </label>
              </div>
              <div className="relative">
                <input type="text" name="companyName" value={form.companyName} onChange={handleChange} id="companyName" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="Company Name" required />
                <label htmlFor="companyName" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">
                  Company Name <span style={{ color: '#061E3E' }}>*</span>
                </label>
              </div>
              <div className="relative">
                <input type="text" name="companyAddress" value={form.companyAddress} onChange={handleChange} id="companyAddress" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="Company Address" />
                <label htmlFor="companyAddress" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">
                  Company Address
                </label>
              </div>
              <div className="relative">
                <input type="text" name="companyWebsite" value={form.companyWebsite} onChange={handleChange} id="companyWebsite" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="Company Website" />
                <label htmlFor="companyWebsite" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">
                  Company Website
                </label>
              </div>
              <div className="relative">
                <input type="text" name="businessActivity" value={form.businessActivity} onChange={handleChange} id="businessActivity" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="Business Activity Type" />
                <label htmlFor="businessActivity" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">
                  Business Activity Type
                </label>
              </div>
              <div className="relative">
                <select name="industrySector" value={form.industrySector} onChange={handleChange} id="industrySector" className={`${inputClass} peer pt-6 placeholder-transparent`}>
                  <option value="">Select Industry Sector</option>
                  {INDUSTRY_SECTORS.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
                <label htmlFor="industrySector" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">
                  Industry Sector
                </label>
              </div>
              <div className="relative">
                <select name="alternateIndustrySector" value={form.alternateIndustrySector} onChange={handleChange} id="alternateIndustrySector" className={`${inputClass} peer pt-6 placeholder-transparent`}>
                  <option value="">Select Alternate Industry Sector (optional)</option>
                  {INDUSTRY_SECTORS.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
                <label htmlFor="alternateIndustrySector" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">
                  Alternate Industry Sector (optional)
                </label>
              </div>
              <div className="relative">
                <input type="text" name="sponsorName" value={form.sponsorName} onChange={handleChange} id="sponsorName" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="Kuwaiti Sponsor/Partner Name" />
                <label htmlFor="sponsorName" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">
                  Kuwaiti Sponsor/Partner Name
                </label>
              </div>
              <div className="relative">
                <select name="nationality" value={form.nationality} onChange={handleChange} id="nationality" className={`${inputClass} peer pt-6 placeholder-transparent`} required>
                  <option value="">Select Nationality</option>
                  <option value="INDIAN">INDIAN</option>
                  <option value="OCI CARD HOLDER">OCI CARD HOLDER</option>
                  <option value="OTHERS">OTHERS</option>
                </select>
                <label htmlFor="nationality" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">
                  Nationality <span style={{ color: '#061E3E' }}>*</span>
                </label>
              </div>
              <div className="relative">
                <select name="membershipType" value={form.membershipType} onChange={handleChange} id="membershipType" className={`${inputClass} peer pt-6 placeholder-transparent`} required>
                  <option value="">Select Membership Type</option>
                  <option value="Individual Member">Individual Member</option>
                  <option value="Corporate Member">Corporate Member</option>
                  <option value="Special Honorary Member">Special Honorary Member</option>
                  <option value="Honorary Member">Honorary Member</option>
                </select>
                <label htmlFor="membershipType" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">
                  Membership Type <span style={{ color: '#061E3E' }}>*</span>
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer inline-flex items-center gap-2">
                  <input type="file" name="photo" onChange={handleChange} accept="image/*" className="hidden" />
                  <span className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 border border-gray-300 rounded hover:bg-gray-300">
                    Upload Photo
                  </span>
                </label>
                {photoPreview ? (
                  <div className="flex items-center gap-3">
                    <img src={photoPreview} alt="Preview" className="w-20 h-20 object-cover rounded-md border" />
                    <button type="button" onClick={removePhoto} className="text-xs hover:underline" style={{ color: '#061E3E' }}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">No file selected</span>
                )}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Identification Details</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="relative">
                <input type="text" name="passportNumber" value={form.passportNumber} onChange={handleChange} id="passportNumber" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="Indian Passport Number" />
                <label htmlFor="passportNumber" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">Indian Passport Number</label>
              </div>
              <div className="relative">
                <input type="text" name="civilId" value={form.civilId} onChange={handleChange} id="civilId" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="Kuwait Civil ID Number" />
                <label htmlFor="civilId" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">Kuwait Civil ID Number</label>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="relative mb-2">
              <textarea name="address" value={form.address} onChange={handleChange} id="address" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="Address in Kuwait" rows="2" />
              <label htmlFor="address" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">Address in Kuwait</label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="relative">
                <input type="tel" name="mobile" value={form.mobile} onChange={handleChange} id="mobile" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="Mobile" required />
                <label htmlFor="mobile" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">Mobile <span className="text-red-500">*</span></label>
              </div>
              <div className="relative">
                <input type="tel" name="officePhone" value={form.officePhone} onChange={handleChange} id="officePhone" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="Office Phone" />
                <label htmlFor="officePhone" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">Office Phone</label>
              </div>
            </div>
            <div className="relative mb-2">
              <input type="tel" name="alternateMobile" value={form.alternateMobile} onChange={handleChange} id="alternateMobile" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="Alternate Mobile (optional)" />
              <label htmlFor="alternateMobile" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">Alternate Mobile (optional)</label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="relative">
                <input type="email" name="email" value={form.email} onChange={handleChange} id="email" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="Email Address" required />
                <label htmlFor="email" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">Email Address <span className="text-red-500">*</span></label>
              </div>
              <div className="relative">
                <input type="email" name="alternateEmail" value={form.alternateEmail} onChange={handleChange} id="alternateEmail" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="Alternate Email (optional)" />
                <label htmlFor="alternateEmail" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">Alternate Email (optional)</label>
              </div>
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
                <textarea name="benefit" value={form.benefit} onChange={handleChange} className={inputClass} rows="3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How can you contribute to IBPC's objectives?</label>
                <textarea name="contribution" value={form.contribution} onChange={handleChange} className={inputClass} rows="3" />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sponsorship</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="relative">
                <input type="text" name="proposer1" value={form.proposer1} onChange={handleChange} id="proposer1" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="First IBPC Member Proposer" />
                <label htmlFor="proposer1" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">First IBPC Member Proposer</label>
              </div>
              <div className="relative">
                <input type="text" name="proposer2" value={form.proposer2} onChange={handleChange} id="proposer2" className={`${inputClass} peer pt-6 placeholder-transparent`} placeholder="Second IBPC Member Proposer" />
                <label htmlFor="proposer2" className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none">Second IBPC Member Proposer</label>
              </div>
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
  }, [step, form, inputClass, handleChange, photoPreview, removePhoto]);

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
