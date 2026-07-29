'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { COOKIE, type Sprache } from './index';

/** Sprache setzen. Ein Jahr gültig, gilt für Server und Browser gleichermaßen. */
export async function spracheSetzen(sprache: Sprache) {
  (await cookies()).set(COOKIE, sprache, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  revalidatePath('/', 'layout');
}
