import { readFileSync, createReadStream } from 'fs';
import { Stream } from 'stream';
import { join } from 'path';
import fileType from 'file-type';
import m from '../src';

const FIXTURES_DIR = join(__dirname, 'fixtures');

async function isJpg(buf: Buffer): Promise<boolean> {
	return (await fileType.fromBuffer(buf))?.ext == 'jpg';
}

test('extract file', async () => {
	const buf = readFileSync(join(FIXTURES_DIR, 'file.zip'));
	const files = await m()(buf);

	expect(files[0].path).toBe('test.jpg');
	expect(files[0].data && await isJpg(files[0].data)).toBe(true);
});

test('extract file using streams', async () => {
	const stream = createReadStream(join(FIXTURES_DIR, 'file.zip'));
	const files = await m()(stream);

	expect(files[0].path).toBe('test.jpg');
	expect(files[0].data && await isJpg(files[0].data)).toBe(true);
});

test('extract file to fileWriter', async () => {
	const fileWriter = jest.fn().mockResolvedValue(null);

	const buf = readFileSync(join(FIXTURES_DIR, 'file.zip'));
	const files = await m()(buf, { fileWriter });

	expect(files[0].path).toBe('test.jpg');
	expect(files[0].data).toBeUndefined();

	expect(fileWriter).toHaveBeenCalledTimes(1);
	expect(fileWriter.mock.calls[0][0]).toHaveProperty('path', 'test.jpg');
	expect(fileWriter.mock.calls[0][1]).toBeInstanceOf(Stream);
});

test('extract multiple files', async () => {
	const buf = readFileSync(join(FIXTURES_DIR, 'multiple.zip'));
	const files = await m()(buf);

	expect(files).toHaveLength(4);
	expect(files[0].path).toBe('0.txt');
	expect(files[0].type).toBe('file');
	expect(files[0].data).toEqual(Buffer.from('1'));
	expect(files[3].path).toBe('3/4/');
	expect(files[3].type).toBe('directory');
});

test('extract symlinks', async () => {
	const buf = readFileSync(join(FIXTURES_DIR, 'symlink.zip'));
	const files = await m()(buf);

	expect(files[0].path).toBe('ReactiveCocoa');
	expect(files[0].type).toBe('symlink');
	expect(files[0].linkname).toBe('Versions/Current/ReactiveCocoa');
});

test('return empty array if non-valid file is supplied', async () => {
	const buf = readFileSync(__filename);
	const files = await m()(buf);

	expect(files).toHaveLength(0);
});

test('throw on wrong input', async () => {
	await expect(m()('foo' as unknown as Buffer))
		.rejects.toThrow('Expected a Buffer or Stream, got string');
});

test('throw once fileWriter throwed', async () => {
	const fileWriter = jest.fn().mockRejectedValue(new Error('Test throw'));
	const buf = readFileSync(join(FIXTURES_DIR, 'file.zip'));
	await expect(m()(buf, { fileWriter }))
		.rejects.toThrow('Test throw');
});
