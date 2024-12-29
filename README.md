# REST API for Video Files

This README provides details on the Video API, its endpoints, and how to use them.

## Base URL

Set the base URL for your API requests as an environment variable:

```
BASE_URL
```

## Authentication

All endpoints require an API key, provided as a header:

```
x-api-key: {{API_KEY}}
```

Replace `{{API_KEY}}` with your actual API key. For testing purposes, you can use the following test API key:

```
8db596e286c5d6fff5e75a44e8a10c1cdf12127aa68a47b0ccb
```

---

## Setup Instructions

Follow these steps to set up the repository:

1. **Install FFmpeg:**
   Ensure FFmpeg is installed on your system. You can download it from [FFmpeg's official website](https://ffmpeg.org/download.html).
   
   Optionally, specify the FFmpeg path in the `.env` file:
   ```
   FFMPEG_PATH=/path/to/ffmpeg
   ```

2. **Install Node.js:**
   Ensure you have Node.js version **20 or greater** installed.

3. **Compile TypeScript to JavaScript:**
   ```bash
   npm run compile
   ```
   This will compile the TypeScript files into JavaScript.

4. **Run Database Migrations:**
   ```bash
   npm run migrate
   ```
   This will create the SQLite database and tables. A `database.sqlite` file will be automatically created in the `dist` directory.

   **Note:** If you are unable to migrate or seed, a `database.sqlite.bak` file is present in the root directory. Rename this file to `database.sqlite` and copy it to the root of the compiled `dist` folder.

5. **Seed the Database:**
   ```bash
   npm run seed
   ```
   This will insert initial data into the database.

6. **Run the Test Suite:**
   ```bash
   npm test
   ```
   This will execute all unit and integration tests to ensure the API works as expected.

7. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   This will start the server in development mode.

---

## Endpoints

### 1. Upload Video

- **URL:** `{{BASE_URL}}/v1/video/upload`
- **Method:** `POST`
- **Headers:**
  - `x-api-key: {{API_KEY}}`
- **Body (form-data):**
  - `video` (file): The video file to upload.

#### Example Request
```curl
curl -X POST "{{BASE_URL}}/v1/video/upload" \
  -H "x-api-key: {{API_KEY}}" \
  -F "video=@/path/to/video.mp4"
```

---

### 2. Trim Video

- **URL:** `{{BASE_URL}}/v1/video/trim/{videoId}`
- **Method:** `PATCH`
- **Headers:**
  - `x-api-key: {{API_KEY}}`
- **Body (JSON):**
  ```json
  {
    "startTime": "00:00:00",
    "endTime": "00:01:30",
    "override": true
  }
  ```

#### Example Request
```curl
curl -X PATCH "{{BASE_URL}}/v1/video/trim/1" \
  -H "x-api-key: {{API_KEY}}" \
  -H "Content-Type: application/json" \
  -d '{
        "startTime": "00:00:00",
        "endTime": "00:01:30",
        "override": true
     }'
```

---

### 3. Merge Videos

- **URL:** `{{BASE_URL}}/v1/video/merge`
- **Method:** `POST`
- **Headers:**
  - `x-api-key: {{API_KEY}}`
- **Query Parameters:**
  - `ids` (comma-separated): IDs of videos to merge.

#### Example Request
```curl
curl -X POST "{{BASE_URL}}/v1/video/merge?ids=1,2" \
  -H "x-api-key: {{API_KEY}}"
```

---

### 4. Generate Video Link

- **URL:** `{{BASE_URL}}/v1/video/generate-link/{videoId}`
- **Method:** `GET`
- **Headers:**
  - `x-api-key: {{API_KEY}}`

#### Example Request
```curl
curl -X GET "{{BASE_URL}}/v1/video/generate-link/8" \
  -H "x-api-key: {{API_KEY}}"
```

---

### 5. List Videos

- **URL:** `{{BASE_URL}}/v1/video/list`
- **Method:** `GET`
- **Headers:**
  - `x-api-key: {{API_KEY}}`

#### Example Request
```curl
curl -X GET "{{BASE_URL}}/v1/video/list" \
  -H "x-api-key: {{API_KEY}}"
```

---

## Configuration

The application includes a `settings` table in the database where the following configurations can be modified:

- **maxSize**: Maximum size (in KB) for uploaded videos.
- **minSize**: Minimum size (in KB) for uploaded videos.
- **maxDuration**: Maximum duration (in seconds) for videos.
- **minDuration**: Minimum duration (in seconds) for videos.
- **linkExpiryInMin**: Expiry time (in minutes) for generated video links.
- **maxVideoMergeCount**: Maximum number of videos that can be merged in a single request.

To change these settings, update the respective values in the `settings` table.

---

## Notes

1. Replace `{{BASE_URL}}` with the actual base URL of the API.
2. Ensure you have the appropriate API key for authorization.
3. Video files and IDs referenced in examples should match your environment.
4. This project uses an SQLite database. When migrations are run, a `database.sqlite` file will be created in the `dist` directory.
5. If you face issues with migrations or seeding, use the `database.sqlite.bak` file in the root directory. Rename it to `database.sqlite` and copy it to the `dist` folder.