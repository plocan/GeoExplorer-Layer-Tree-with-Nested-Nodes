![Picture](https://plocan.eu/wp-content/uploads/PLOC_logo.svg)
# Gis-web

## Table of contents
1. [GeoExplorer-PLOCAN](#GeoExplorer-PLOCAN)
    1. [Prerequisites](#Prerequisites)
    2. [Advantages](#Advantages)
2. [Getting a copy of the application](#Getting a copy of the application)
3. [Running in development mode](#Running in development mode)
4. [Preparing the application for deployment](#Preparing the application for deployment)
5. [Versioning](#Versioning)
6. [Authors](#Authors)

## GeoExplorer-PLOCAN
These instructions describe how to build this `modified` version of GeoExplorer in Ubuntu 14.04 as part of OpenGeo Suite 4.8. After a successful OpenGeo Suite installation, GeoExplorer will be located under this directory `/usr/share/opengeo/`.

### Prerequisites

The GeoExplorer source directory contains what you need to run the application as a servlet with an integrated persistence layer. 
You will need:

* [Opengeo Suite](https://boundlessgeo.com/boundless-suite/)
* Java 8 - [Java Development Kit (JDK)](http://www.oracle.com/technetwork/java/javase/downloads/index.html) - 1.8+ or [Open JDK](http://openjdk.java.net/install/) 
* [Apache Ant](http://ant.apache.org/bindownload.cgi) - 1.8+
* [Apache Ivy](http://ant.apache.org/ivy/download.cgi) - 2.3+
* [Git](http://git-scm.com/) - 1.7.10+* 

### Advantages

The main advantages of this modified version regarding the original is the possibility of adding/removing/updating unlimited nested nodes of categories to improve layers organization. As a result we take full control of our data. It also carry out the management(save and load) of composed maps. This maps are listed  in a table and each map is linked to a composer and viewer application inside GeoExplorer depending if we want to update them or just publish them. The operation of composing a map require authentication. Drag and drop of layers between categories nodes is allowed.

## Getting a copy of the application

To get a copy of the application source code, use [Git](http://git-scm.com/):

    you@prompt:~$ git clone -b master http://192.168.53.152/Web-Dev/gis-web.git

## Running in development mode

The application can be run in development or distribution mode.  In development mode, individual scripts are available to a debugger.  In distribution mode, scripts are concatenated and minified.

To run the application in development mode:

    you@prompt:~$ cd geoexplorer
    you@prompt:~/geoexplorer$ ant -Dapp.proxy.geoserver=http://192.168.53.87:8080/geoserver/ debug

If the build succeeds, you'll be able to browse to the application at http://192.168.53.87:9080/.

In addition, if you want to make a remote GeoServer available at the `/geoserver/` path, you can set the `app.proxy.geoserver` system property as follows:

    you@prompt:~/geoexplorer$ ant -Dapp.proxy.geoserver=http://example.com/geoserver/ debug


## Preparing the application for deployment

Running GeoExplorer as described above is not suitable for production because JavaScript files will be loaded dynamically.  First, we'll need to delete the original GeoExplorer application in the production environment and replacig it with the modified one. Once inside it, run `ant build` and find the resulting `geoexplorer.war` in the `target` directory. Move the `target/geoexplorer.war` file to your production environment (e.g. a  servlet container). Let's see it through a typical example:

    you@prompt:~$ service tomcat7 stop
    you@prompt:~$ cd /usr/share/opengeo/
    you@prompt:~$ git clone -b master http://192.168.53.152/Web-Dev/gis-web.git 
    you@prompt:~$ rm –R geoexplorer 
    you@prompt:~$ mv gis-web geoexplorer
    you@prompt:~$ cd geoexplorer 
    you@prompt:~$ ant build
    you@prompt:~$ unzip target/geoexplorer.war –d /usr/share/opengeo/geoexplorer 
    you@prompt:~$ service tomcat7 start


GeoExplorer writes to a geoexplorer.db when saving maps.  The location of this file is determined by the `GEOEXPLORER_DATA` value at runtime.  This value can be set as a servlet initialization parameter or a Java system property.

The `GEOEXPLORER_DATA` value must be a path to a directory that is writable by  the process that runs the application.  The servlet initialization parameter is given precedence over a system property if both exist.

As an example, if you want the geoexplorer.db file to be written to your `/tmp` directory, modify GeoExplorer's `web.xml` file to include the following:

    <init-param>
        <param-name>GEOEXPLORER_DATA</param-name>
        <param-value>/tmp</param-value>
    </init-param>

When GeoExplorer is running in development mode, the SQlite geoexplorer .db database it points to, is located under /usr/share/opengeo/geoexplorer/target directory, while .db file of the production environment is located in a different location /var/lib/opengeo/.

If you want to be the same .db database for production and development mode then just go to /usr/share/opengeo/geoexplorer/build.xml file and change the following line:

    <sysproperty key="GEOEXPLORER_DATA" path="target"/>

to: 

    <sysproperty key="GEOEXPLORER_DATA" path="/var/lib/opengeo/geoexplorer"/>

then rebuild the project so changes will take effect: 

    you@prompt:~$ cd /usr/share/opengeo/geoexplorer 
    you@prompt:~$ ant build

## Versioning
The proyect is still on developing to have any version yet.

## Authors
* **Tania Morales** - *Team manager* - tania.morales@plocan.eu
* **Javier Gonzalez** - *Team revisions* - javier.gonzalez@plocan.eu
* **José Díaz** - *Developer* - ordicu85@gmail.com


