#!/bin/bash

# load common functions
. "$( cd "$( dirname "$0" )" && pwd )"/functions 

set -x

DIST_ROOT=/var/www/suite

# build category
build_cat=`init_build_cat $CAT`

# build name
build_name=`init_build_name $NAME`

# set up the maven repository for this particular branch/tag/etc...
#TODO: fix dist_path logic and how it relates to maven repo, etc...
MVN_SETTINGS=`init_mvn_repo $MVN_REPO`
if [ -z $MAVEN_OPTS ]; then
  export MAVEN_OPTS=-Xmx256m
fi

# checkout the requested revision to build
cd git
if [ ! -z $REV ]; then
  git checkout $REV

  # if this rev is a tag don't pull
  if [ "$( git tag | grep $REV )" != $REV ]; then
     git pull origin $REV
  fi

  git submodule update --init --recursive
fi

# extract the actual revision number
export build_rev=`get_rev`

build_info="-Dbuild.date=$BUILD_ID -Dbuild.revision=$build_rev"

gs_externals="geoserver/externals"
gs_rev=`get_submodule_rev $gs_externals/geoserver`
gs_branch=`get_submodule_branch $gs_externals/geoserver`
gt_rev=`get_submodule_rev $gs_externals/geotools`
gt_branch=`get_submodule_branch $gs_externals/geotools`
gwc_rev=`get_submodule_rev $gs_externals/geowebcache`
gwc_branch=`get_submodule_branch $gs_externals/geowebcache`

# only use first seven chars
build_rev=${build_rev:0:7}

echo "building $build_rev ($REV) with maven settings $MVN_SETTINGS"

dist=$DIST_ROOT/$build_cat/$build_rev
if [ ! -e $dist ]; then
  mkdir -p $dist
fi

echo "exporting artifacts to: $dist"

skip_externals=""
if [ "$SKIP_EXTERNALS" == "yes" ] || [ "$SKIP_EXTERNALS" == "true" ]; then
  skip_externals="-P !externals" 
fi

# perform a full build
$MVN -nsu -s $MVN_SETTINGS -Dfull $skip_externals -Dmvn.exec=$MVN -Dmvn.settings=$MVN_SETTINGS $build_info -Dgs.flags="-Dbuild.commit.id=$gs_rev -Dbuild.branch=$gs_branch -DGit-Revision=$gt_rev -Dgt.Git-Revision=$gt_rev" $BUILD_FLAGS clean install
checkrv $? "maven install"

# clean out old assembly artifacts, usually maven clean does this but it could
# be skipped if this not a full build
rm target/*.zip

$MVN -nsu -s $MVN_SETTINGS initialize assembly:attached $build_info
checkrv $? "maven assembly"

#$MVN -s $MVN_SETTINGS -Dmvn.exec=$MVN -Dmvn.settings=$MVN_SETTINGS $build_info deploy -DskipTests
#checkrv $? "maven deploy"

# copy the new artifacts into place
cp target/*.zip $dist

# alias the build with the build name
dist_alias=$DIST_ROOT/$build_cat/$build_name
[ -e $dist_alias ] && [ rm -rf $dist_alias ]
mkdir -p $dist_alias
for f in `ls $dist`; do
  g=`echo $f | sed "s/\(opengeosuite-\)[0-9a-z]\+\(-.*\)/\1$build_name\2/g"`
  ln -sf $dist/$f $dist_alias/$g
done

# Archive build if requested
if [ "$ARCHIVE_BUILD" == "true" ]; then
  dist_arch=$DIST_ROOT/archive/$build_name
  [ -e $dist_arch ] && [ rm -rf $dist_arch ];
  cp -r $dist $dist_arch
else
  ARCHIVE_BUILD="false"
fi

# clean up old artifacts
pushd $dist/..

# keep around last two builds (plus the last alias we created)
ls -t | tail -n +3 | xargs rm -rf
popd

# start_remote_job <url> <name> <api_key>
function start_remote_job() {
   local creds=build:$3
   curl -k --connect-timeout 10 --user $creds "$1/buildWithParameters?CAT=${build_cat}&REV=${build_rev}&NAME=${build_name}&ARCHIVE_BUILD=${ARCHIVE_BUILD}&TOKEN=buildme"
   #checkrv $? "trigger $2 with ${build_cat} r${rev}"
}

WIN=162.209.53.106
OSX=199.19.86.219

# start the build of the OSX installer
start_remote_job http://$OSX:8080/job/mac-installer "osx installer"  7babda1c4cf05ee099baa3d4c6579dab
start_remote_job http://$WIN:8080/job/win-installer-32 "win installer" c7df8777ad146449f39272c596e963e4

# start the build of the Windows installer
#start_remote_job http://$WIN:8080/hudson/job/windows-installer "win installer"

echo "Done."
