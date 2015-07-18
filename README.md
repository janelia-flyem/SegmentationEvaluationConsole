# Segmentation Evaluation Console [![Picture](https://raw.github.com/janelia-flyem/janelia-flyem.github.com/master/images/HHMI_Janelia_Color_Alternate_180x40.png)](http://www.janelia.org)

##Web application for analyzing EM segmentation results against ground truth

The application provides visualizations for the segmentation evaluations computed
by [DVIDSparkServices](https://github.com/janelia-flyem/DVIDSparkServices) and
stored in [DVID](https://github.com/janelia-flyem/dvid) .  Please see DVIDSparkServices documentation for more information about the metrics.

With small modifications, it is possible to reuse application components 
without DVIDSparkServices or DVID if evaluation results conform to the output
produced by DVIDSparkServices.

##Installation and Usage

    % npm install
    % grunt

Installed js file located in build/js/bundle.js.  The application can be included
statically on a webpage by anchoring to a div named 'segeval':

    % < div id="segeval" > < /div >


