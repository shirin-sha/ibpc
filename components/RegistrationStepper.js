import Link from "next/link";
import { useState } from "react";

const steps = [
  { number: "1", title: "Personal & Business Info", icon: "👤" },
  { number: "2", title: "Identification Details", icon: "🪪" },
  { number: "3", title: "Contact Information", icon: "📞" },
  { number: "4", title: "Application Details", icon: "📝" },
  { number: "5", title: "Sponsorship", icon: "🤝" },
  { number: "6", title: "Declaration", icon: "✅" }
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegistrationStepper({ onSubmit }) {
  const [step, setStep] = useState(0);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    profession: "",
    businessActivity: "",
    sponsorName: "",
    passportNumber: "",
    civilId: "",
    address: "",
    officePhone: "",
    residencePhone: "",
    mobile: "",
    email: "",
    benefit: "",
    contribution: "",
    proposer1: "",
    proposer2: "",
    photo: null,
    consent: false,
  });

  // Validation for each step
  const isStepValid = () => {
    switch (step) {
      case 0:
        return (
          form.fullName.trim() &&
          form.profession.trim() &&
          form.companyName.trim() &&
          form.businessActivity.trim() &&
          form.sponsorName.trim()
        );
      case 1:
        return (
          form.passportNumber.trim() &&
          form.civilId.trim()
        );
      case 2:
        return (
          form.address.trim() &&
          form.mobile.trim() &&
          form.email.trim() &&
          emailRegex.test(form.email)
        );
      case 3:
        return true; // Always valid since fields are optional
      case 4:
        return (
          form.proposer1.trim() &&
          form.proposer2.trim()
        );
      case 5:
        return form.consent;
      default:
        return false;
    }
  };

  const handleChange = (e) => {
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
  };

  const removePhoto = () => {
    setForm(prev => ({ ...prev, photo: null }));
    setPhotoPreview(null);
  };

  const nextStep = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'photo' && form[key]) formData.append('photo', form[key]);
        else if (key !== 'photo') formData.append(key, form[key]);
      });

      // Replace with your API endpoint
      const response = await fetch('/api/register', { method: 'POST', body: formData });
      const result = await response.json();

      if (response.ok) {
        alert('Registration submitted successfully!');
        if (onSubmit) onSubmit(result);
        setForm({
          fullName: "", companyName: "", profession: "", businessActivity: "",
          sponsorName: "", passportNumber: "", civilId: "", address: "",
          officePhone: "", residencePhone: "", mobile: "", email: "",
          benefit: "", contribution: "", proposer1: "", proposer2: "",
          photo: null, consent: false,
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

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 placeholder-gray-400";

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
          {/* Grey background line. Adjusted padding to align with circle centers */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[calc(100%-100px)] h-0.5 bg-gray-200">
            {/* Green progress line */}
            <div
              className="h-full bg-green-600 transition-all duration-300"
              style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
            />
          </div>
          {/* Step circles and titles */}
          <div className="relative flex justify-between">
            {steps.map((item, idx) => {
              const isActive = idx === step;
              const isComplete = idx < step;

              return (
                <div key={idx} className="flex flex-col items-center z-10"> {/* z-10 ensures circles are above line */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center
                      ${isComplete
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-gray-600 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                  >
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
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal & Business Information</h2>
              <div className="grid gap-3">
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className={inputClass}
                  required
                />
                <input
                  type="text"
                  name="profession"
                  value={form.profession}
                  onChange={handleChange}
                  placeholder="Profession & Designation"
                  className={inputClass}
                  required
                />
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Company Name"
                  className={inputClass}
                  required
                />
                <input
                  type="text"
                  name="businessActivity"
                  value={form.businessActivity}
                  onChange={handleChange}
                  placeholder="Business Activity Type"
                  className={inputClass}
                  required
                />
                <input
                  type="text"
                  name="sponsorName"
                  value={form.sponsorName}
                  onChange={handleChange}
                  placeholder="Kuwaiti Sponsor/Partner Name"
                  className={inputClass}
                  required
                />
                {/* Photo Picker */}
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2">
                    <input
                      type="file"
                      name="photo"
                      onChange={handleChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <span className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700
                                       border border-gray-300 rounded hover:bg-gray-300">
                      Upload Photo
                    </span>
                  </label>
                  {photoPreview ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">No file selected</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Identification Details</h2>
              <div className="grid gap-3">
                <input
                  type="text"
                  name="passportNumber"
                  value={form.passportNumber}
                  onChange={handleChange}
                  placeholder="Indian Passport Number"
                  className={inputClass}
                  required
                />
                <input
                  type="text"
                  name="civilId"
                  value={form.civilId}
                  onChange={handleChange}
                  placeholder="Kuwait Civil ID Number"
                  className={inputClass}
                  required
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid gap-3">
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Address in Kuwait"
                  className={inputClass}
                  rows="2"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="tel"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Mobile"
                    className={inputClass}
                    required
                  />
                  <input
                    type="tel"
                    name="officePhone"
                    value={form.officePhone}
                    onChange={handleChange}
                    placeholder="Office Phone"
                    className={inputClass}
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={inputClass}
                  required
                />
                {/* Email validation error */}
                {form.email && !emailRegex.test(form.email) && (
                  <span className="text-xs text-red-600">Please enter a valid email address.</span>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details (Optional)</h2>
              <div className="grid gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    How would you benefit from IBPC membership? 
                  </label>
                  <textarea
                    name="benefit"
                    value={form.benefit}
                    onChange={handleChange}
                    className={inputClass}
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    How can you contribute to IBPC's objectives?
                  </label>
                  <textarea
                    name="contribution"
                    value={form.contribution}
                    onChange={handleChange}
                    className={inputClass}
                    rows="3"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sponsorship</h2>
              <div className="grid gap-3">
                <input
                  type="text"
                  name="proposer1"
                  value={form.proposer1}
                  onChange={handleChange}
                  placeholder="First IBPC Member Proposer"
                  className={inputClass}
                  required
                />
                <input
                  type="text"
                  name="proposer2"
                  value={form.proposer2}
                  onChange={handleChange}
                  placeholder="Second IBPC Member Proposer"
                  className={inputClass}
                  required
                />
              </div>
            </div>
          )}

          {step === 5 && (
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
                  <input
                    type="checkbox"
                    name="consent"
                    checked={form.consent}
                    onChange={handleChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    required
                  />
                  <span className="text-sm text-gray-600">
                    I accept the terms and conditions and consent to the processing of my information
                    according to IBPC's privacy policy.
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 mt-6 border-t gap-2">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 0}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700
                         hover:bg-gray-50 disabled:opacity-50 text-sm"
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`w-full sm:w-auto px-4 py-2 bg-gray-900 text-white rounded-lg
                           hover:bg-gray-800 transition-colors text-sm ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isStepValid() || isSubmitting}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg
                            hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
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
          <Link
            href="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}