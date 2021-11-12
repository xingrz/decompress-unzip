@xingrz/decompress-unzip [![test](https://github.com/xingrz/decompress-unzip/actions/workflows/test.yml/badge.svg)](https://github.com/xingrz/decompress-unzip/actions/workflows/test.yml)
==========

[![][npm-version]][npm-url] [![][npm-downloads]][npm-url] [![license][license-img]][license-url] [![issues][issues-img]][issues-url] [![stars][stars-img]][stars-url] [![commits][commits-img]][commits-url]

[@xingrz/decompress](https://github.com/xingrz/decompress) .zip plugin.

## Install

```
$ npm install --save @xingrz/decompress-unzip
```

## Usage

```ts
import decompress from '@xingrz/decompress';
import decompressUnzip from '@xingrz/decompress-unzip';

(async () => {
	await decompress('unicorn.zip', 'dist', {
		plugins: [
			decompressUnzip()
		]
	});

	console.log('Files decompressed');
})();
```

## API

### `decompressUnzip(): (input: Buffer | Readable) => Promise<File[]>`

Returns a `Promise<File[]>`.

#### input

Type: `Buffer` or [`stream.Readable`](https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#class-streamreadable)

Buffer or stream to decompress.

Note: Although input of stream is supported, ZIP format itself doesn't support extracting in stream. This means memory consumption should be considered.

## License

[MIT License](LICENSE)

[npm-version]: https://img.shields.io/npm/v/@xingrz/decompress-unzip.svg?style=flat-square
[npm-downloads]: https://img.shields.io/npm/dm/@xingrz/decompress-unzip.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@xingrz/decompress-unzip
[license-img]: https://img.shields.io/github/license/xingrz/decompress-unzip?style=flat-square
[license-url]: LICENSE
[issues-img]: https://img.shields.io/github/issues/xingrz/decompress-unzip?style=flat-square
[issues-url]: https://github.com/xingrz/decompress-unzip/issues
[stars-img]: https://img.shields.io/github/stars/xingrz/decompress-unzip?style=flat-square
[stars-url]: https://github.com/xingrz/decompress-unzip/stargazers
[commits-img]: https://img.shields.io/github/last-commit/xingrz/decompress-unzip?style=flat-square
[commits-url]: https://github.com/xingrz/decompress-unzip/commits/master
