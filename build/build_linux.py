#!/usr/bin/env python

# Runs the OpenGeo Suite linux build jobs in serial. Running them in parallel
# can cause locking issues with the repos if more than one rpm or deb finishes at
# the same time.

import json, urllib2, time, os

queue_api_path = "/hudson/queue/api/json"
active_builds = []

class Server:
    def __init__(self, arch, url, os):
        self._arch = arch
        self._url = url
        self._os = os
    @property
    def arch(self):
	    """Architecture of server"""
	    return self._arch
    @property
    def url(self):
    	"""Location of server"""
        return self._url
    @property
    def os(self):
    	"""Operating System/Distro of server"""
        return self._os

centos_build_servers = [
    Server(arch="i368", url="http://packaging-c55-32.dev.opengeo.org:8080", os="centos"),
    Server(arch="x86_64", url="http://packaging-c55-64.dev.opengeo.org:8080", os="centos")
]
ubuntu_build_servers = [
    Server(arch="i386", url="http://packaging-u1040-32.dev.opengeo.org:8080", os="ubuntu"),
    Server(arch="x86_64", url="http://packaging-u1040-64.dev.opengeo.org:8080", os="ubuntu")
]

def buildServerIsDone(server):
	"""Polls the server's queue API to check if all jobs have completed."""
	jobs = json.loads(urllib2.urlopen(server.url + queue_api_path).read())
	if len(jobs['items']) == 0:
	    active_builds.remove(server)
	    return True
	else:
	    return False

def startNightlyBuild(server, dist_path="latest", revision="latest", repo="test"):
	"""Starts a build of all components on the server"""
	urllib2.urlopen("%s/hudson/job/build/buildWithParameters?DIST_PATH=%s&REV=%s&REPO=%s" % (server.url, dist_path, revision, repo))
	print "Building revision %s on %s %s into %s" % (revision, server.os, server.arch, repo)
	active_builds.append(server)

def main():
    try:
        dist_path = os.environ['DIST_PATH']
    except:
        dist_path = "latest"
    try:
        revision = os.environ['REV']
        if revision.upper() == 'HEAD':
            revision = "latest"
    except:
        revision = "latest"
    try:
        repo = os.environ["REPO"]
    except:
        repo = "test"

    startNightlyBuild(centos_build_servers.pop(), dist_path, revision, repo)
    startNightlyBuild(ubuntu_build_servers.pop(), dist_path, revision, repo)
    
    queue_not_empty = True
    
    while queue_not_empty:
        for server in active_builds:
            if buildServerIsDone(server):
            	if server.os == "ubuntu" and len(ubuntu_build_servers) != 0:
            		startNightlyBuild(ubuntu_build_servers.pop(), dist_path, revision, repo)
            	elif server.os == "centos" and len(centos_build_servers) != 0:
            		startNightlyBuild(centos_build_servers.pop(), dist_path, revision, repo)
            	
            	if len(ubuntu_build_servers) == 0 and len(centos_build_servers) == 0:
            		queue_not_empty = False
            else:
            	time.sleep(120)

if __name__ == "__main__":
    main()
