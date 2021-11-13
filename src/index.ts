import type { DecompressPlugin, DecompressPluginOptions, File } from '@xingrz/decompress-types';
import * as fileType from 'file-type';
import yauzl, { ZipFile } from 'yauzl';
import isStream from 'is-stream';
import pond from 'pond';
import { promisify } from 'util';
import { once } from 'events';

const loadZip = promisify<Buffer, yauzl.Options, ZipFile | undefined>(yauzl.fromBuffer);

function getType(entry: yauzl.Entry, mode: number): 'file' | 'directory' | 'symlink' {
	const IFMT = 61440;
	const IFDIR = 16384;
	const IFLNK = 40960;
	const madeBy = entry.versionMadeBy >> 8;

	if ((mode & IFMT) === IFLNK) {
		return 'symlink';
	}

	if ((mode & IFMT) === IFDIR || (madeBy === 0 && entry.externalFileAttributes === 16)) {
		return 'directory';
	}

	return 'file';
}

async function extractEntry(entry: yauzl.Entry, zip: ZipFile, opts: DecompressPluginOptions): Promise<File> {
	const mode = (entry.externalFileAttributes >> 16) & 0xFFFF;

	const file: File = {
		mode: mode,
		mtime: entry.getLastModDate(),
		path: entry.fileName,
		type: getType(entry, mode),
	};

	if (file.mode === 0 && file.type === 'directory') {
		file.mode = 0o755;
	}

	if (file.mode === 0) {
		file.mode = 0o644;
	}

	const openReadStream = promisify(zip.openReadStream.bind(zip));

	try {
		const stream = await openReadStream(entry);
		if (!stream) {
			return file;
		}

		if (file.type == 'symlink') {
			file.linkname = (await pond(stream).spoon()).toString();
		}

		if (opts?.fileWriter) {
			await opts.fileWriter(file, file.type == 'file' ? stream : undefined);
		} else if (file.type == 'file') {
			file.data = await pond(stream).spoon();
		}

		return file;
	} catch (e) {
		zip.close();
		throw e;
	}
}

async function extractFile(zip: ZipFile, opts: DecompressPluginOptions): Promise<File[]> {
	const files: File[] = [];

	zip.on('entry', async (entry: yauzl.Entry) => {
		try {
			const file = await extractEntry(entry, zip, opts);
			files.push(file);
			zip.readEntry();
		} catch (e) {
			zip.emit('error', e);
		}
	});
	zip.readEntry();

	await once(zip, 'end');
	return files;
}

export default (): DecompressPlugin<DecompressPluginOptions> => async (input, opts) => {
	if (!Buffer.isBuffer(input) && !isStream(input)) {
		throw new TypeError(`Expected a Buffer or Stream, got ${typeof input}`);
	}

	if (isStream(input)) {
		input = await pond(input).spoon();
	}

	const type = await fileType.fromBuffer(input);
	if (!type || type.ext !== 'zip') {
		return [];
	}

	const zip = await loadZip(input, { lazyEntries: true });
	if (!zip) {
		return [];
	}

	return extractFile(zip, opts || {});
};
