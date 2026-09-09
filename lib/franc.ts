import { franc as originalFrancFn } from "franc";

export const francToSpeechRecognitionLocale: Record<string, string> = {
	// Major languages, reliable support
	cmn: 'zh',
	spa: 'es',
	eng: 'en',
	rus: 'ru',
	arb: 'ar',
	ben: 'bn',
	hin: 'hi',
	por: 'pt',
	ind: 'id',
	jpn: 'ja',
	fra: 'fr',
	deu: 'de',
	kor: 'ko',
	tel: 'te',
	vie: 'vi',
	mar: 'mr',
	ita: 'it',
	tam: 'ta',
	tur: 'tr',
	urd: 'ur',
	guj: 'gu',
	pol: 'pl',
	ukr: 'uk',
	kan: 'kn',
	mal: 'ml',
	pes: 'fa',
	mya: 'my',
	swh: 'sw',
	ron: 'ro',
	pan: 'pa', // Punjabi
	amh: 'am',
	hau: 'ha', // uncertain support
	bos: 'bs',
	hrv: 'hr',
	nld: 'nl',
	srp: 'sr',
	tha: 'th',
	ckb: 'ku', // central Kurdish - very uncertain support
	yor: 'yo', // uncertain support
	zlm: 'ms',
	ibo: 'ig', // uncertain support
	npi: 'ne', // uncertain support
	tgl: 'fil',
	hun: 'hu',
	azj: 'az', // uncertain support
	sin: 'si', // uncertain support
	ell: 'el',
	ces: 'cs',
	bel: 'be', // uncertain support
	kin: 'rw', // uncertain support
	zul: 'zu',
	bul: 'bg',
	swe: 'sv',
	som: 'so', // uncertain support
	kaz: 'kk', // uncertain support
	uig: 'ug', // support très uncertain
	hat: 'ht', // uncertain support
	khm: 'km',
	sna: 'sn', // uncertain support
	xho: 'xh',
	hye: 'hy',
	afr: 'af',
	fin: 'fi',
	slk: 'sk',
	dan: 'da',
	nob: 'nb',
	nno: 'nn', // uncertain support
	heb: 'he',
	tgk: 'tg', // uncertain support
	cat: 'ca',
	kat: 'ka',
	glg: 'gl',
	lao: 'lo', // uncertain support
	lit: 'lt',
	mkd: 'mk', // uncertain support
	kir: 'ky', // uncertain support
	slv: 'sl',
	lvs: 'lv',
	epo: 'eo', // very uncertain support
	uzn: 'uz', // uncertain support
	tuk: 'tk', // very uncertain support

	// languages without known support for SpeechRecognition to this day
	jav: 'jv',
	mai: 'mai',
	sun: 'su',
	bho: 'bho',
	fuv: 'ff',
	nhn: 'nah',
};

const DEFAULT_LOCALE = 'en';

export function franc(text: string): string {
	const francCode = originalFrancFn(text);
	return francToSpeechRecognitionLocale[francCode] ?? DEFAULT_LOCALE;
}