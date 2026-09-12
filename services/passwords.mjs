import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

export const hashPassword = async (password) => {
	const salt = randomBytes(16).toString('hex');

	const hash = await scryptAsync(password, salt, 64, {
		N: 131072,
		r: 8,
		p: 1,
		maxmem: 256 * 1024 * 1024,
	});

	return `scrypt$131072$8$1$${salt}$${hash.toString('hex')}`;
};

export const verifyPassword = async (password, passwordHash) => {
	if (typeof passwordHash !== 'string') {
		return false;
	}

	const match = passwordHash.match(
		/^scrypt\$131072\$8\$1\$([a-f0-9]{32})\$([a-f0-9]{128})$/,
	);

	if (!match) {
		return false;
	}

	const [, salt, storedHash] = match;

	const hash = await scryptAsync(password, salt, 64, {
		N: 131072,
		r: 8,
		p: 1,
		maxmem: 256 * 1024 * 1024,
	});

	return timingSafeEqual(hash, Buffer.from(storedHash, 'hex'));
};
