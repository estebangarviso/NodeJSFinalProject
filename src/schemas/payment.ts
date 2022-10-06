import { Type } from '@sinclair/typebox';

export const urlID = Type.String({ minLength: 6, maxLength: 6 });
