#!/bin/bash

./gradlew ${1:-installDevMinSdkDevKernelDebug} --stacktrace && adb shell am start -n com.kaiserapps.stretto/host.exp.exponent.MainActivity
