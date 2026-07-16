// Must be imported first in server.js, before any module that reads
// process.env at load time (e.g. utils/email.js constructs the Resend
// client at import time) — ESM import statements in a file all execute
// before that file's own top-level code, so dotenv.config() being called
// later in server.js is too late to affect modules imported above it.
import dotenv from 'dotenv';

dotenv.config();
