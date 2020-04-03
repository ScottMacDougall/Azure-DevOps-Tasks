# IPA and APK manipulation tasks

Collection of Azure DevOps Tasks for manipulating .apk and .ipa files

## iOS
### Unpack IPA Task
![unpack ipa task](https://github.com/ScottMacDougall/Azure-DevOps-Tasks/raw/master/art/unpack-ipa.png)

This task unpacks a .ipa file so that you can make modifications to it before repackaging, and re-signing it again.

#### Parameters
* Path: The relative path to the ipa file to unpack

#### Output
* UNPACKED_IPA_PATH: Path to the unpackaged .ipa file.
* UNPACKED_APK_NAME: The name of the original .ipa file. Useful for repacking with the same name as the original.

Output variables values can be found in the console log of the task.

### Repack IPA Task
![repack ipa task](https://github.com/ScottMacDougall/Azure-DevOps-Tasks/raw/master/art/repack-ipa.png)

This task repackages a .ipa file. Note: You will have to re-sign the .ipa file after repackaging.

#### Parameters
* Path to unpacked IPA: The path to the unpackaged ipa file that you want to repack. Defaults to UNPACKED_IPA_PATH from Unpack IPA Task
*IPA Name: The name of the .ipa file after repackaging. Defaults to UNPACKED_IPA_NAME from Unpack IPA Task.

#### Output
* REPACKAGED_IPA_FILE: The path to the repackaged .ipa file.

Output variables values can be found in the console log of the task.

### Update iOS App Icon Task
![Update iOS Ap Icon (Source) task](https://github.com/ScottMacDougall/Azure-DevOps-Tasks/raw/master/art/update-ios-icon-source.png)
![Update iOS Ap Icon (IPA) task](https://github.com/ScottMacDougall/Azure-DevOps-Tasks/raw/master/art/update-ios-icon-ipa.png)

This task will update the App Icon in the Assets.xcasset folder in your source code.

The way it works, is you supply a high res image file (preferably at least 500x500px), and this task will generate all the required icon sizes that you would normally do manually.

Select 'Source' and run this prior to building an ipa file. This option is for using this Task in a Build pipeline.

If you select 'IPA', then this task will update the App Icon in an Assets.xcasset folder, compile, then replace the assets.car file in the .ipa file.  This option is for using this Task in a Releast pipeline.

You should copy your original Assets.xcasset folder into your Artifact Staging Directory prior to publishing your artifact, so that it will be accessible to this Task. This task does not decompile the origianl assets.car file, so the original Assets.xcassets folder needs to be used instead.

#### Parameters
* Location of assets being replaced: Whether this task is replacing an App Icon in the original source code, or a compiled .ipa file.
* Path to IPA (When IPA option selected): Path to the .ipa file.
* Icon: Path to the high res image that will be used to generate the App Icons.
* Path to Assets.xcassets folder: The path to the Assets.xcassets folder where the App Icon will be replaced.
* App Icon Asset Name (Advanced): The name of the Icon asset in Assets.xcassets. Defaults to AppIcon. Update this if your App Icon reosurce in the Assets.xcassets differs from the default.

#### Output
* REPACKAGED_IPA_FILE: Path to the repackaged IPA file.

## Android

### Unpack APK Task
![unpack apk task](https://github.com/ScottMacDougall/Azure-DevOps-Tasks/raw/master/art/unpack-apk.png)
![pack apk task](https://github.com/ScottMacDougall/Azure-DevOps-Tasks/raw/master/art/pack-apk.png)

This task packs, or unpacks an .apk file so that you can make modifications to it.

#### Parameters
* Pack or unpack: Select whether you're using this task to pack, or unpack an apk file.
* Path to APK (When Unpack selected): The relative path to the apk file to unpack
* Path to unpacked APK (When Pack selected): Relative path to unpacked APK. Defaults to UNPACKED_APK_PATH variable which is set when this task is used to unpack an apk.
* APK name (When Pack selected): Name you want to use for the newly packed apk. Defaults to UNPACKED_APK_NAME variable which is set when this task is used to unpack the apk.
* ApkTool Arguments: Additional ApkTool arguments to use

#### Output
* UNPACKED_APK_PATH (When Unpack selected): Path to the unpackaged .apk file.
* UNPACKED_APK_NAME (When Unpack selected): The name of the original .apk file. Useful for repacking with the same name as the original.
* REPACKAGED_APK_FILE (When pack selected): Path to the repackaged .apk file

Output variables values can be found in the console log of the task.