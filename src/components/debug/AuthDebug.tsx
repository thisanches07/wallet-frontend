// src/components/debug/AuthDebug.tsx
import { useCategories } from "@/context/CategoriesContext";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { useState } from "react";

export function AuthDebug() {
  const { user, token } = useAuth();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const api = useApi();
  const [testResults, setTestResults] = useState<any[]>([]);

  const addTestResult = (name: string, result: any) => {
    setTestResults((prev) => [
      ...prev,
      { name, result, timestamp: new Date() },
    ]);
  };

  const testBackendConnection = async () => {
    try {
      const result = await api.getUserProfile();
      addTestResult("GET /api/users/me", { success: true, data: result });
    } catch (error) {
      addTestResult("GET /api/users/me", {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const testCategoriesEndpoint = async () => {
    try {
      const result = await authService.apiCall("/api/categories");
      addTestResult("GET /api/categories", result);
    } catch (error) {
      addTestResult("GET /api/categories", {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const testDirectApiCall = async () => {
    try {
      const result = await authService.apiCall("/api/health");
      addTestResult("Direct API Call (/api/health)", result);
    } catch (error) {
      addTestResult("Direct API Call", {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const clearResults = () => setTestResults([]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-sm">
      <h3 className="font-bold text-gray-900 mb-3">🔧 Auth Debug Panel</h3>

      <div className="space-y-2 mb-4">
        <div className="text-xs">
          <strong>User:</strong> {user ? user.email : "Not logged in"}
        </div>
        <div className="text-xs">
          <strong>Token:</strong>{" "}
          {token ? `${token.substring(0, 20)}...` : "No token"}
        </div>
        <div className="text-xs">
          <strong>Stored Token:</strong> {authService.getToken() ? "Yes" : "No"}
        </div>
        <div className="text-xs">
          <strong>Categories:</strong>{" "}
          {categoriesLoading ? "Loading..." : `${categories.length} loaded`}
          {categoriesError && (
            <span className="text-red-500"> (Error: {categoriesError})</span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={testBackendConnection}
          className="w-full text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test GET /api/users/me
        </button>
        <button
          onClick={testCategoriesEndpoint}
          className="w-full text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test GET /api/categories
        </button>
        <button
          onClick={testDirectApiCall}
          className="w-full text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test /api/health
        </button>
        <button
          onClick={clearResults}
          className="w-full text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        <h4 className="font-semibold text-xs text-gray-700">Test Results:</h4>
        {testResults.length === 0 ? (
          <p className="text-xs text-gray-500">No tests run yet</p>
        ) : (
          testResults.map((result, index) => (
            <div
              key={index}
              className="text-xs border border-gray-200 rounded p-2"
            >
              <div className="font-semibold">{result.name}</div>
              <div
                className={
                  result.result.success ? "text-green-600" : "text-red-600"
                }
              >
                {result.result.success ? "✅ Success" : "❌ Error"}
              </div>
              <pre className="text-xs mt-1 overflow-x-auto">
                {JSON.stringify(result.result, null, 2)}
              </pre>
              <div className="text-xs text-gray-400 mt-1">
                {result.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
