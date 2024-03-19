import { httpStatusCode } from '@/constants';
import { appBaseUrlHeaderName, isBanCountry, isInMaintenance } from '@/edge';
import {
  isIncludeLanguageAppPath,
  isLanguage,
  mightExtractLanguageFromAppPath,
  removeLanguageFromAppPath,
} from '@/features';
import {
  NextResponse,
  type NextMiddleware,
  type NextRequest,
} from 'next/server';

export const config = {
  matcher: [
    '/',
    '/en',
    '/ja',
    '/upload',
    '/en/upload',
    '/ja/upload',
    '/terms',
    '/en/terms',
    '/ja/terms',
    '/privacy',
    '/en/privacy',
    '/ja/privacy',
    '/maintenance',
    '/en/maintenance',
    '/ja/maintenance',
  ],
};

export const middleware: NextMiddleware = async (req: NextRequest) => {
  const { nextUrl } = req;

  const isBanCountryResult = await isBanCountry(req);
  if (isBanCountryResult) {
    return NextResponse.json(
      { message: 'Not available from your region.' },
      { status: httpStatusCode.forbidden },
    );
  }

  if (!isIncludeLanguageAppPath(nextUrl.pathname)) {
    return NextResponse.json(
      { message: 'An unexpected error has occurred.' },
      { status: httpStatusCode.internalServerError },
    );
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(appBaseUrlHeaderName, nextUrl.origin);

  const language = mightExtractLanguageFromAppPath(nextUrl.pathname);
  const isInMaintenanceMode = await isInMaintenance();
  if (isInMaintenanceMode) {
    nextUrl.pathname = '/maintenance';
    if (isLanguage(language) && language !== 'ja') {
      nextUrl.pathname = `${language}/maintenance`;
    }

    return NextResponse.rewrite(
      nextUrl,
      {
        request: {
          headers: requestHeaders,
        },
      },
    );
  }

  if (language === 'ja') {
    const removedLanguagePath = removeLanguageFromAppPath(nextUrl.pathname);
    if (nextUrl.pathname !== '/ja') {
      return NextResponse.redirect(
        new URL(removedLanguagePath, req.url),
        {
          status: httpStatusCode.found,
          statusText: 'Found',
          headers: requestHeaders,
        },
      );
    }

    return NextResponse.redirect(
      new URL('/', req.url),
      {
        status: httpStatusCode.found,
        statusText: 'Found',
        headers: requestHeaders,
      },
    );
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
};
