import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { ApiError, AuthError, ValidationError, InternalError, isApiError } from './errors';
import { authOptions } from '@/lib/auth/config';

/**
 * API Response wrapper
 */
export interface ApiHandlerResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Middleware: Check authentication
 */
export async function withAuth(
  handler: (req: NextRequest, session: any) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      return await handler(req, session);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Middleware: Validate input with Zod schema
 */
export function withValidation<T>(schema: z.ZodSchema) {
  return (handler: (req: NextRequest, data: T, session: any) => Promise<NextResponse>) => {
    return async (req: NextRequest, session: any) => {
      try {
        let data: T;

        if (req.method === 'GET') {
          const searchParams = req.nextUrl.searchParams;
          const params: Record<string, any> = {};
          searchParams.forEach((value, key) => {
            params[key] = isNaN(Number(value)) ? value : Number(value);
          });
          data = schema.parse(params);
        } else {
          data = schema.parse(await req.json());
        }

        return await handler(req, data, session);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.flatten().fieldErrors;
          return NextResponse.json(
            {
              success: false,
              error: 'Validation failed',
              errors,
            },
            { status: 400 }
          );
        }
        return handleApiError(error);
      }
    };
  };
}

/**
 * Middleware: Handle try-catch + errors
 */
export function withErrorHandling(
  handler: (req: NextRequest, session: any) => Promise<NextResponse>,
) {
  return async (req: NextRequest, session: any) => {
    try {
      return await handler(req, session);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Centralized error handler
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]', error);

  if (isApiError(error)) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        errors: error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: 'Unknown error',
    },
    { status: 500 }
  );
}

/**
 * Wrap handler with auth + error handling
 */
export function apiHandler<T = any>(
  handler: (req: NextRequest, session: any) => Promise<NextResponse<T>>,
) {
  return async (req: NextRequest) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      return await handler(req, session);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
