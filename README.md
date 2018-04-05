# File Uploader Mongo

This application is a server side written with Node Js.

This application is an example to upload File to a Mongo Database.

MongoDb , and GridFs are used to store the Data.

Instead of storing a file in a single document, GridFS divides the file into parts, or chunks, and stores each chunk as a separate document. By default, GridFS uses a chunk size of 255 kB; that is, GridFS divides a file into chunks of 255 kB with the exception of the last chunk. The last chunk is only as large as necessary. Similarly, files that are no larger than the chunk size only have a final chunk, using only as much space as needed plus some additional metadata.

GridFS uses two collections to store files. One collection stores the file chunks, and the other stores file metadata. The section GridFS Collections describes each collection in detail.

When you query GridFS for a file, the driver will reassemble the chunks as needed. You can perform range queries on files stored through GridFS. You can also access information from arbitrary sections of files, such as to “skip” to the middle of a video or audio file.

GridFS is useful not only for storing files that exceed 16 MB but also for storing any files for which you want access without having to load the entire file into memory.

In this app you can:
- Upload files
- Display images
- Download files
- Delete files

The home page will display all the Data from the Database with buttons Submit to Upload,Download,and Delete.

#screen of the app
<img src="https://raw.githubusercontent.com/raphym/FileUploaderMongo/master/fileUploader.jpg" width="800" height="400">
