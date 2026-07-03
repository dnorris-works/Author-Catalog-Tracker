import { NextResponse } from 'next/server';

// Thrown deliberately by lib/ functions when there's a specific, safe-to-show
// message for the client (e.g. "ISBN already in use"). Anything else thrown
// (DB errors, network errors, etc.) is treated as internal and never shown
// to the client — only logged server-side.
export class ApiError extends Error {
    status: number;
    constructor(message: string, status = 400) {
        super(message);
        this.status = status;
    }
}

export function errorResponse(err: unknown, context: string): NextResponse {
    if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(context, err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
}
