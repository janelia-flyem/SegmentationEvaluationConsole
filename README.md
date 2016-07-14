# Segmentation Evaluation Console [![Picture](https://raw.github.com/janelia-flyem/janelia-flyem.github.com/master/images/HHMI_Janelia_Color_Alternate_180x40.png)](http://www.janelia.org)

##Web application for analyzing EM segmentation results against ground truth

This javascript web application provides visualizations for evaluating the quality of large 3D image segmentation against another segmentation or so-called ground truth.  Here we consider evaluation computed
by [DVIDSparkServices](https://github.com/janelia-flyem/DVIDSparkServices) that uses the services and interface provided by [DVID](https://github.com/janelia-flyem/dvid) .  Please see DVIDSparkServices documentation for more information about the metrics and stats computed.

![Picture](https://raw.githubusercontent.com/janelia-flyem/SegmentationEvaluationConsole/master/tutorial/overallview.png)


The goal of this app is to provide insight into the places where segmentation succeeds and fails.  To this end, it shows information as a function of both the segmented body and the X,Y,Z location, not just as a summary stat.  It also shows many summary stats to provide a better basis of a comparison between segmentations.  The target domain is to analyze segmentation for EM connectomics (see the [Fly EM project](https://www.janelia.org/project-team/fly-em)).  While some of the terminology and application are geared to this domain, some of this effort could be reused in a more general sense.

##Installation and Usage

To simply use the application, open dist/application.html with a web browser.  The distribution folder is updated regularly with code changes.  Examples can be found in the zipped file, examples.tgz.

For more detailed usage information, consult the corresponding wiki [https://github.com/janelia-flyem/SegmentationEvaluationConsole/wiki](https://github.com/janelia-flyem/SegmentationEvaluationConsole/wiki).

##Developer Guide

This is single-page app written primarily in Javascript using Facebook's React to facilitate a component reuse throughout the application.  It should be relatively straightforward to add new widgets/componets for visualization.  The application, at some point, should allow the user to dynamically select the panels that should be viewable for a given experiment.

###Installation and Usage

    % npm install
    % grunt

Installed js file located in build/js/bundle.js.  The application can be included
on a webpage by anchoring to a div named 'segeval':

    % <div id="segeval"> </div>

On chrome, the application must be served to avoid same-origin policy errors.
Grunt automatically starts a server at localhost:3000, so simply navigate to this location in your browser with
grunt running locally to view the application.

###Architectural Notes

As noted, the application makes use of React components.  It also leverages 3rd party libraries extensively, such as [stack3d](https://github.com/janelia-flyem/stack3D) for visualizing the subvolumes in the image volume.

This application expects JSON files formatted in the same manner as produced by DVIDSparkServices (this can be downloaded from a DVID server or from file).  The file format is still going through rapid revision but it is possible to decouple this viewer from DVIDSparkServices.  In general, the file format defines different "types" of comparison each with a set of different metrics/stats for each type.

##TODO

* Continual small UI enhancements
* Make more robust to incorrect user input and deprecated file formats
* Allow download of tables to CSV
* Add new visualization widgets and make general plugin system to allow easy swapping (at both compile time and at the app level)

