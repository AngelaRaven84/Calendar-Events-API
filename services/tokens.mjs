import { SignJWT, jwtVerify } from 'jose';

export const createAccessToken = async (userId) => {
	const secret = process.env.JWT_SECRET;

	if (!secret || !/^[a-f0-9]{64}$/.test(secret)) {
		throw new Error('JWT_SECRET is missing or invalid');
	}

	const key = Buffer.from(secret, 'hex');

	return new SignJWT({})
		.setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
		.setSubject(userId)
		.setIssuer('calendar-events-api')
		.setAudience('calendar-events-api')
		.setIssuedAt()
		.setExpirationTime('15m')
		.sign(key);
};

export const verifyAccessToken = async (token) => {
	const secret = process.env.JWT_SECRET;

	if (!secret || !/^[a-f0-9]{64}$/.test(secret)) {
		throw new Error('JWT_SECRET is missing or invalid');
	}

	const key = Buffer.from(secret, 'hex');

	const { payload } = await jwtVerify(token, key, {
		algorithms: ['HS256'],
		issuer: 'calendar-events-api',
		audience: 'calendar-events-api',
		typ: 'JWT',
		requiredClaims: ['sub', 'iat', 'exp'],
	});

	if (typeof payload.sub !== 'string' || !payload.sub) {
		throw new Error('Token is missing a valid user ID');
	}

	return payload.sub;
};
