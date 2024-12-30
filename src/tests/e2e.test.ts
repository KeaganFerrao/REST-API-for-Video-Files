import request from 'supertest';
import { app, server } from '../index';
import path from 'path';
import fs from 'fs';
import { setting, user, video } from '../models/index';
import sequelize from '../setup/sequelize';

const uploadedVideos: string[] = [];

describe('Video APIs', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
        await user.create({
            userName: 'test',
            token: 'testtoken'
        });
        await setting.create({
            maxSize: 100000,
            minSize: 10,
            maxDuration: 100,
            minDuration: 1,
            linkExpiryInMin: 60,
            maxVideoMergeCount: 5
        });
    });

    afterAll(async () => {
        await user.destroy({
            where: {}
        })
        await setting.destroy({
            where: {}
        });
        await video.destroy({
            where: {}
        });

        await sequelize.close();
        server.close();

        for (const video of uploadedVideos) {
            fs.unlinkSync(path.join(__dirname, '../uploads', video));
        }
    });

    it('should upload a video and return video metadata', async () => {
        const videoPath = path.join(__dirname, 'assets', 'video.mp4');
        const videoBuffer = fs.readFileSync(videoPath);

        const response = await request(app)
            .post('/v1/video/upload')
            .attach('video', videoBuffer, 'test-video.mp4')
            .set('Content-Type', 'multipart/form-data')
            .set('x-api-key', 'testtoken')
            .expect(201);

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('uniqueId', expect.any(String));

        const savedVideo = await video.findOne({
            where: {
                uniqueId: response.body.data.uniqueId
            }
        });
        expect(savedVideo).toBeTruthy();
        expect(fs.existsSync(path.join(__dirname, '../uploads', savedVideo!.uniqueId))).toBe(true);

        uploadedVideos.push(savedVideo!.uniqueId);
    });

    it('should upload a video greater than maximum duration', async () => {
        const videoPath = path.join(__dirname, 'assets', 'video1.mp4');
        const videoBuffer = fs.readFileSync(videoPath);

        await request(app)
            .post('/v1/video/upload')
            .attach('video', videoBuffer, 'test-video.mp4')
            .set('Content-Type', 'multipart/form-data')
            .set('x-api-key', 'testtoken')
            .expect(400);
    });

    it('should return 400 if no file is provided', async () => {
        const response = await request(app)
            .post('/v1/video/upload')
            .set('x-api-key', 'testtoken')
            .expect(400);
    });

    it('should return 400 if invalid file type is uploaded', async () => {
        const invalidFilePath = path.join(__dirname, 'assets', 'invalid.png');
        const invalidFileBuffer = fs.readFileSync(invalidFilePath);

        await request(app)
            .post('/v1/video/upload')
            .attach('video', invalidFileBuffer, 'invalid.png')
            .set('Content-Type', 'multipart/form-data')
            .set('x-api-key', 'testtoken')
            .expect(400);
    });

    it('should upload and trim the uploaded video', async () => {
        const videoPath = path.join(__dirname, 'assets', 'video.mp4');
        const videoBuffer = fs.readFileSync(videoPath);

        const response = await request(app)
            .post('/v1/video/upload')
            .attach('video', videoBuffer, 'test-video.mp4')
            .set('Content-Type', 'multipart/form-data')
            .set('x-api-key', 'testtoken')
            .expect(201);

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('uniqueId', expect.any(String));

        const savedVideo = await video.findOne({
            where: {
                uniqueId: response.body.data.uniqueId
            }
        });
        expect(savedVideo).toBeTruthy();
        expect(fs.existsSync(path.join(__dirname, '../uploads', savedVideo!.uniqueId))).toBe(true);

        const trimResponse = await request(app)
            .patch(`/v1/video/trim/${savedVideo!.id}`)
            .send({
                startTime: "00:00:00",
                endTime: "00:00:10",
                override: true
            })
            .set('x-api-key', 'testtoken')
            .expect(200);

        expect(trimResponse.body).toHaveProperty('data');
        expect(trimResponse.body.data).toHaveProperty('uniqueId', expect.any(String));

        const savedTrimmedVideo = await video.findOne({
            where: {
                uniqueId: trimResponse.body.data.uniqueId
            }
        });
        expect(savedTrimmedVideo).toBeTruthy();
        expect(fs.existsSync(path.join(__dirname, '../uploads', savedTrimmedVideo!.uniqueId))).toBe(true);

        uploadedVideos.push(trimResponse.body.data.uniqueId);
    });

    it('should upload and trim the uploaded video with an invalid duration beyond the video', async () => {
        const videoPath = path.join(__dirname, 'assets', 'video.mp4');
        const videoBuffer = fs.readFileSync(videoPath);

        const response = await request(app)
            .post('/v1/video/upload')
            .attach('video', videoBuffer, 'test-video.mp4')
            .set('Content-Type', 'multipart/form-data')
            .set('x-api-key', 'testtoken')
            .expect(201);

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('uniqueId', expect.any(String));

        const savedVideo = await video.findOne({
            where: {
                uniqueId: response.body.data.uniqueId
            }
        });
        expect(savedVideo).toBeTruthy();
        expect(fs.existsSync(path.join(__dirname, '../uploads', savedVideo!.uniqueId))).toBe(true);

        await request(app)
            .patch(`/v1/video/trim/${savedVideo!.id}`)
            .send({
                startTime: "00:00:00",
                endTime: "00:01:10",
                override: true
            })
            .set('x-api-key', 'testtoken')
            .expect(400);

        uploadedVideos.push(savedVideo!.uniqueId);
    });

    it('should upload a video and generate video link', async () => {
        const videoPath = path.join(__dirname, 'assets', 'video.mp4');
        const videoBuffer = fs.readFileSync(videoPath);

        const response = await request(app)
            .post('/v1/video/upload')
            .attach('video', videoBuffer, 'test-video.mp4')
            .set('Content-Type', 'multipart/form-data')
            .set('x-api-key', 'testtoken')
            .expect(201);

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('uniqueId', expect.any(String));

        const savedVideo = await video.findOne({
            where: {
                uniqueId: response.body.data.uniqueId
            }
        });
        expect(savedVideo).toBeTruthy();
        expect(fs.existsSync(path.join(__dirname, '../uploads', savedVideo!.uniqueId))).toBe(true);

        const linkResponse = await request(app)
            .get(`/v1/video/generate-link/${savedVideo!.id}`)
            .set('x-api-key', 'testtoken')
            .expect(201);

        expect(linkResponse.body).toHaveProperty('data');
        expect(linkResponse.body.data).toHaveProperty('link', expect.any(String));

        uploadedVideos.push(savedVideo!.uniqueId);
    });

    it('should try to generate video link for an invalid un-uploaded video id', async () => {
        await request(app)
            .get(`/v1/video/generate-link/1234`)
            .set('x-api-key', 'testtoken')
            .expect(404);
    });

    it('should upload a video and list it', async () => {
        const videoPath = path.join(__dirname, 'assets', 'video.mp4');
        const videoBuffer = fs.readFileSync(videoPath);

        const response = await request(app)
            .post('/v1/video/upload')
            .attach('video', videoBuffer, 'test-video.mp4')
            .set('Content-Type', 'multipart/form-data')
            .set('x-api-key', 'testtoken')
            .expect(201);

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('uniqueId', expect.any(String));

        const savedVideo = await video.findOne({
            where: {
                uniqueId: response.body.data.uniqueId
            }
        });
        expect(savedVideo).toBeTruthy();
        expect(fs.existsSync(path.join(__dirname, '../uploads', savedVideo!.uniqueId))).toBe(true);

        const listResponse = await request(app)
            .get(`/v1/video/list`)
            .set('x-api-key', 'testtoken')
            .expect(200);

        expect(listResponse.body).toHaveProperty('data');
        expect(listResponse.body.data).toBeInstanceOf(Array);
        expect(listResponse.body.data[0]).toHaveProperty('id', expect.any(Number));

        uploadedVideos.push(savedVideo!.uniqueId);
    });

    it('should upload 2 videos and merge it', async () => {
        const videoPath = path.join(__dirname, 'assets', 'video.mp4');
        const videoBuffer = fs.readFileSync(videoPath);

        const responses = await Promise.all([
            request(app)
                .post('/v1/video/upload')
                .attach('video', videoBuffer, 'test-video.mp4')
                .set('Content-Type', 'multipart/form-data')
                .set('x-api-key', 'testtoken')
                .expect(201),
            request(app)
                .post('/v1/video/upload')
                .attach('video', videoBuffer, 'test-video.mp4')
                .set('Content-Type', 'multipart/form-data')
                .set('x-api-key', 'testtoken')
                .expect(201)
        ]);

        const savedVideo1 = await video.findOne({
            where: {
                uniqueId: responses[0].body.data.uniqueId
            }
        });
        expect(savedVideo1).toBeTruthy();

        const savedVideo2 = await video.findOne({
            where: {
                uniqueId: responses[1].body.data.uniqueId
            }
        });
        expect(savedVideo2).toBeTruthy();

        const mergeResponse = await request(app)
            .post(`/v1/video/merge?ids=${savedVideo1!.id},${savedVideo2!.id}`)
            .set('x-api-key', 'testtoken')
            .expect(201);

        expect(mergeResponse.body).toHaveProperty('data');
        expect(mergeResponse.body.data).toHaveProperty('uniqueId', expect.any(String));

        uploadedVideos.push(savedVideo1!.uniqueId, savedVideo2!.uniqueId, mergeResponse.body.data.uniqueId);
    });

    it('should try to merge 2 invalid un-uploaded video ids', async () => {
        await request(app)
            .post(`/v1/video/merge?ids=1234,12345`)
            .set('x-api-key', 'testtoken')
            .expect(404);
    });

});
