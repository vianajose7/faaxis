import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getJwtToken } from '@/lib/jwtTokenStorage'; // Import only what we need

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get CSRF token from the response headers
let csrfToken: string | null = null;

// Function to get CSRF token from response headers
function updateCsrfToken(headers: Headers) {
  const newToken = headers.get('X-CSRF-Token');
  if (newToken) {
    csrfToken = newToken;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  customHeaders: Record<string, string> = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(customHeaders || {}),
  };

  // Include CSRF token in headers if we have one
  if (csrfToken && (method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD')) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  // ✅ Always attach Authorization header if token exists
  // Always refresh from localStorage to get the freshest token
  const currentToken = getJwtToken(true); // true = refresh from localStorage
  if (currentToken) {
    // console.log('Attaching header', currentToken.substring(0, 10) + '...'); // TEMP debug
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  // Ensure URL always starts with a forward slash for API paths
  let apiUrl = url;
  if (apiUrl.startsWith('api/')) {
    apiUrl = '/' + apiUrl;
  }
  
  // Add a cache-busting parameter for GET requests
  if (method.toUpperCase() === 'GET') {
    const cacheBuster = `_t=${Date.now()}`;
    const hasParams = apiUrl.includes('?');
    apiUrl = `${apiUrl}${hasParams ? '&' : '?'}${cacheBuster}`;
  }
  
  // Special debug logging for registration requests
  if (apiUrl === '/api/register') {
    console.log('📤 Sending registration request:', {
      url: apiUrl,
      method: method,
      dataFields: data ? Object.keys(data as object) : 'none',
      hasAuthHeader: !!headers['Authorization']
    });
  }
  
  try {
    const res = await fetch(apiUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // ✅ Also send cookies
    });

    // Get CSRF token from response
    updateCsrfToken(res.headers);
    
    // Special handling for registration responses
    if (apiUrl === '/api/register') {
      console.log('📥 Registration response received:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        headers: {
          contentType: res.headers.get('content-type'),
          setCookie: res.headers.has('set-cookie') ? 'present' : 'absent'
        }
      });
    }
    
    // Don't throw for registration endpoint, let the caller handle errors
    if (apiUrl === '/api/register') {
      return res;
    }
    
    // For all other endpoints, throw if not OK
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Special error handling for registration
    if (apiUrl === '/api/register') {
      console.error('❌ Registration request error:', error);
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Add explicit cache control headers to prevent caching of authenticated requests
      const headers: Record<string, string> = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      // ✅ Always include JWT token in Authorization header if available
      const currentToken = getJwtToken(true); // true = refresh from localStorage
      if (currentToken) {
        // console.log('Attaching header to query', currentToken.substring(0, 10) + '...'); // TEMP debug
        headers['Authorization'] = `Bearer ${currentToken}`;
      }

      // Ensure URL always starts with a forward slash for API paths
      let url = queryKey[0] as string;
      if (url.startsWith('api/')) {
        url = '/' + url;
      }
      
      // Add a cache-busting parameter to prevent caching
      const cacheBuster = `_t=${Date.now()}`;
      const hasParams = url.includes('?');
      const urlWithCache = `${url}${hasParams ? '&' : '?'}${cacheBuster}`;
      
      const res = await fetch(urlWithCache, {
        credentials: "include", // Always include credentials for session cookies
        headers,
        cache: 'no-store'
      });

      // Update CSRF token from response headers
      updateCsrfToken(res.headers);

      // Special handling for 401 unauthorized responses
      if (res.status === 401) {
        console.log("Received 401 unauthorized from API");
        
        // For all 401 responses, clear any user data from query cache
        // This ensures the UI correctly shows logged out state
        queryClient.setQueryData(["/api/user"], null);
        
        // For API routes that expect silent handling, return null
        if (unauthorizedBehavior === "returnNull") {
          return null;
        } else {
          throw new Error("Unauthorized");
        }
      }

      // Check for success status
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`API error (${res.status}):`, errorText);
        throw new Error(`API error: ${res.status} ${errorText}`);
      }

      // Successfully got data
      return await res.json();
    } catch (error) {
      console.error("Query error:", error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Only refetch when window regains focus after being hidden
      staleTime: 5 * 60 * 1000, // 5 minutes - better balance between freshness and performance
      retry: 1, // Retry once on failure
      gcTime: 10 * 60 * 1000, // 10 minutes - keep unused data in memory longer (formerly cacheTime)
    },
    mutations: {
      retry: 1, // Retry once on failure
    },
  },
});
