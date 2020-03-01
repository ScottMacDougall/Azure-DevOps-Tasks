#!/usr/bin/env bash
#npm install
for dir in common/**/
do 
    cd ${dir}
    npm install
    npm version 1.0.$1
    tsc
    cd ../../   
done
npm pack common/ipa-utilities/
npm pack common/apk-utilities/
for dir in Tasks/ipa-*/
do 
    cd ${dir}
    npm install ../../ipa-utilities-1.0.$1.tgz
    npm install
    npm version 1.0.$1
    tsc
    cd ../../   
done
for dir in Tasks/apk-*/
do 
    cd ${dir}
    npm install ../../apk-utilities-1.0.$1.tgz
    npm install
    npm version 1.0.$1
    tsc
    cd ../../   
done

#npm install Tasks/**/
# tsc Tasks/**/*.ts