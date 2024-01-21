import inspect, { type Options as InspectOptions } from 'browser-util-inspect';

/**
 * 文字列をワードの配列に分割する  \
 * ハイフン・アンダーバー・空白文字 が含まれている場合は、そこで区切る。  \
 * 含まれていない場合は、大文字の手前で区切る。  \
 * ただし、連続する大文字は、後ろのワードの一部となる。
 * @param value
 * @example
 * splitWord('hello-NewWorld'); // ['hello', 'NewWorld']
 * splitWord('helloNewWorld'); // ['hello', 'New', 'World']
 * splitWord('helloNEWWorld'); // ['hello', 'NEWWorld']
 */
export const separateWord = (value: string): string[] => {
	if (DELIMITER_SPLIT_REGEXP.test(value)) return value.split(DELIMITER_SPLIT_REGEXP);
	return value.split(UPPERCASE_SPLIT_REGEXP);
};

/**
 * 先頭が大文字のキャメルケースにする
 * @param value
 * @example
 * upperCamelCase('hello world'); // HelloWorld
 */
export const upperCamelCase = (value: string): string => {
	const words = separateWord(value);
	return words.map((w) => (w ? `${w[0].toUpperCase()}${w.substring(1).toLowerCase()}` : '')).join('');
};

/**
 * 先頭が小文字のキャメルケースにする
 * @param value
 * @example
 * lowerCamelCase('Hello World'); // helloWorld
 */
export const lowerCamelCase = (value: string): string => {
	const upper = upperCamelCase(value);
	return upper ? `${upper[0].toLowerCase()}${upper.substring(1)}` : '';
};

/**
 * 全て小文字のスネークケースにする
 * @param value
 * @example
 * snakeCase('hello World'); // hello_world
 */
export const snakeCase = (value: string): string => {
	const words = separateWord(value);
	return words.map((w) => w.toLowerCase()).join('_');
};

/**
 * 全て小文字のケバブケースにする
 * @param value
 * @example
 * kebabCase('hello World'); // hello-world
 */
export const kebabCase = (value: string): string => {
	const words = separateWord(value);
	return words.map((w) => w.toLowerCase()).join('-');
};

/**
 * 正規表現パターンの文字をエスケープします
 * @param value
 * @returns
 */
export const escapeRegExp = (value: string): string => {
	return value.replace(REGEXP_ESCAPE_REGEXP, '\\$&');
};

/**
 * 第1引数の文字列の {0},{1},... を、第2引数以降の値で置き換える  \
 * {}の中の数値は、第2引数で作られる配列のindexと一致する。  \
 * {0} のような文字列をそのまま表示したい場合は、  \
 * {{0}} のように二重にすることでエスケープされる。
 * @param format
 * @param args
 * @example
 */
export const formatText = (format: string, ...args: unknown[]) => {
	// formatText("{0} {1}", "{1}", 100); とされたときに
	// "100 100" ではなく "{1} 100" となるように、2回ループをかけている。
	const escape = (v: unknown) => `${v}`.replace(FORMAT_TEXT_ESCAPE_REGEXP, '{$&}');
	for (const [i, v] of args.entries()) {
		const r = new RegExp(`(?<!\\{)\\{${i}\\}(?!\\})`, 'g');
		format = format.replace(r, escape(v));
	}
	for (let i = 0; i < args.length; i++) {
		const r = new RegExp(`\\{\\{${i}\\}\\}`, 'g');
		format = format.replace(r, `{${i}}`);
	}
	return format;
};

/**
 * 引数がリテラルの場合はそのまま文字列に、  \
 * それ以外の場合は inspect 関数に通して返す。
 * @param v
 * @param opt inspect関数に渡すオプションの一部
 * @returns
 */
export const inspecter = (v: unknown, opt?: { depth?: number | null; showHidden?: boolean }): string => {
	if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
		return v.toString();
	}
	if (v instanceof Error) {
		return v.stack ?? v.message;
	}
	return inspect(v, { ...(opt as InspectOptions) });
};

const DELIMITER_SPLIT_REGEXP = /[-_\s]/gm;
const UPPERCASE_SPLIT_REGEXP = /(?<![A-Z])(?=[A-Z])/gm;
const REGEXP_ESCAPE_REGEXP = /[.*+?^${}()|[\]\\]/g;
const FORMAT_TEXT_ESCAPE_REGEXP = /(?<!\{)\{([1-9]\d*|0)\}(?!\})/g;
