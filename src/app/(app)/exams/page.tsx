import { redirect } from 'next/navigation';

/**
 * /exams — alias for /exam-center
 *
 * Redirects to the canonical exam center route.
 */

export default function ExamsRedirect() {
  redirect('/exam-center');
}
