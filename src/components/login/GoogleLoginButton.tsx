interface GoogleLoginButtonProps {
  onClick: () => void;
}

export function GoogleLoginButton({ onClick }: GoogleLoginButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 hover:bg-gray-100 transition-all shadow-sm"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="w-5 h-5"
      />
      <span>Entrar com Google</span>
    </button>
  );
}
