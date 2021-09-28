# Couponator

## Local Development
### Initial setup
Clone the repo and `npm install` to install. _Do not `npm start` yet._

### Environment file
You must create a `.env.local` file with the following contents for parts of the app to work correctly. Any time you update this file, you must kill the development server and rerun `npm start`.

```
REACT_APP_VERSION=$npm_package_version
REACT_APP_PREVENT_WELCOME_ON_VERSIONS=1.1.1
SERVER_PORT=3001
AWS_ACCESS_KEY=1234567890ABCDEF
AWS_SECRET_KEY=ABCDEF1234567890
AWS_REGION=us-east-1
S3_BUCKET=some.s3.bucket
S3_KEY_PREFIX=SomePathInBucket/
```

#### `REACT_APP_VERSION`
The current app version as listed in `package.json`. This should literally be `$npm_package_version` and the package version will be pulled automatically.

#### `REACT_APP_PREVENT_WELCOME_ON_VERSIONS`
A comma-separated list of app versions for which the welcome modal should not display. (Minor updates, etc.)

#### `SERVER_PORT`
Port on which the server listens. This should remain `3001`, but if you have any reason to change it, the `proxy` URL in `package.json` will need updated to reflect the new port.

#### `AWS_ACCESS_KEY`
AWS Access Key for the user with which the app will access the S3 bucket.

#### `AWS_SECRET_KEY`
AWS Secret Key for the user with which the app will access the S3 bucket.

#### `AWS_REGION`
The AWS region in which the S3 bucket exists.

#### `S3_BUCKET`
The name of the S3 bucket.

#### `S3_KEY_PREFIX`
If the app is not inserting into the top level of the bucket, this is the "path" to the correct directory for images created in the Coupon or Starburst tabs. _Trailing slash is required._

#### `S3_KEY_PREFIX_UPLOADS`
If the app is not inserting into the top level of the bucket, this is the "path" to the correct directory for images uploaded via the Upload tab. _Trailing slash is required._ Note if an image created with Couponator is uploaded, it will be uploaded to the `S3_KEY_PREFIX` path.

### Start the server
Run `npm run dev` to start the React development server and the Express server concurrently. The app should open in the browser, but if it does not, navigate to `localhost:3000`.

#### Testing built versions of the app
`localhost:3000` will load the React development server, but directly visiting `localhost:3001` (the Express server) will attempt to serve the contents of the `build` directory. This is useful to test the app after running `npm run build`. `proxy` is ignored in this case and the built `index.html` is served directly from the Express server as it will be in production.

## Deploying to Docker
### Building
Run `npm run build:rc` to generate release candidate files (which will still have debug logs and will prevent GA tracking but will otherwise build production-ready files). Run `npm run build` to generate the final build files.

Ensure you're at the root of the Couponator directory and run `docker build -t couponator:XXXX .` where `XXXX` is the version number. (Use version number as the tag. If a test build is necessary, use something like `1.3.1-rc.1` to denote the first release candidate build.)

### Pushing

Open ECR within AWS, click the `couponator` repository, and click "View push commands" in the top right. Follow the instructions therein to push the built Docker image to the AWS repo. Note if pushing from Windows, you'll need AWS Tools for Powershell.

If the command from Step 1 of the push commands doesn't work, try the following:

```aws --region us-east-1 ecr get-login-password | docker login --username AWS --password-stdin [AWS URL here...]```

In Steps 3 and 4 of the push commands, be sure to replace the `latest` tag with the tag you used when building the Docker image. For example:

Step 3: ```docker tag couponator:1.3.1-rc.1 [AWS URL here...]/couponator:1.3.1-rc.1```

Step 4: ```docker push [AWS URL here...]/couponator:1.3.1-rc.1```

#### Tag Immutability
Tag immutability is enabled for the `couponator` repo by default. This is used "to prevent image tags from being overwritten by subsequent image pushes using the same tag." Essentially it will disallow you from pushing a tag which already exists in the repo in ECR. This should typically be left in place to keep order of the tags and to ensure we are intentionally pushing the tags we want to push. This is also why it's recommended to use `-rc.X` in the tag if you're testing a build, and then use the plain version number for the final release tag.

Tag immutability _can_ technically be disabled if there is a good reason to push the same tag, but be sure to enable it again after pushing.

### Deploying
#### Update the Task Definition
1. Within ECS, click "Task Definitions."
2. Click the checkbox next to what should be the only task definition (`first-run-task-definition`) and click "Create new revision."
3. Under the "Container Definitions" section, click `couponator`.
4. Update the "Image" URL to reference the new tag. Nothing else needs changed.
5. Click "Update."
6. Click "Create."

#### Update the Cluster
1. Within ECS, click "Clusters" and click `couponator-cluster`.
2. Click `couponator-service` and click the "Update" button.
3. Update the "Revision" under "Task Definition" to the revision you just created (which should be labeled "latest").
4. Click "Skip to review" as nothing else needs changed.
5. Click "Update Service."

#### Restart the Task
The currently-running task should automatically re-delpoy to use the updated task definition. If it doesn't after a few minutes,you may need to manually kill the running task. The service is configured to run one task, and if a task is not running it will start one to meet its desired count. After stopping the existing task, a new one will spin up within a couple minutes. _Note: Couponator will be unavailable during this time._
1. Click the checkbox next to the task on the "Tasks" tab within the cluster.
2. Click "Stop."
3. Wait for a new task to automatically spin up.
4. Verify the live site is available and updated.
