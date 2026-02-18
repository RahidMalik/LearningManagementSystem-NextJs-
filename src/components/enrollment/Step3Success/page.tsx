export const Step3Success = () => {
  return (
    <div className="text-center space-y-6 animate-in zoom-in-95 duration-500 py-10">
      <h2 className="text-2xl font-bold">Transaction Completed!</h2>

      {/* Success Illustration Placeholder */}
      <div className="relative w-full aspect-square flex items-center justify-center">
        <div className="absolute w-48 h-48 bg-blue-100 rounded-full animate-pulse"></div>
        <img
          src="/success-illustration.png"
          className="relative z-10 w-64"
          alt="Success"
        />
      </div>

      <p className="text-slate-500 px-6">
        Your enrollment is successful. You can now start learning your favorite
        course!
      </p>

      <button
        onClick={() => (window.location.href = "/dashboard")}
        className="w-full bg-[#0a348f] text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200"
      >
        Back to Home
      </button>
    </div>
  );
};
