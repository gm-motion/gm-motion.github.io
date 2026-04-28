# GM-Motion Portfolio Website
This is the repository for Gavin Morris' portfolio website. The website is located [here](https://gm-motion.github.io)

# For Admin

This website is hosted on Github Pages and uses Sanity.io to store assets and editable information.

To edit website information, open the [Sanity Studio](https://gm-motion.sanity.studio/) for the project in a browser. Login through Github. 

You will encounter the following 'Content' documents to edit:
* About Page
* Home Page
* Work Page
* Header and Footer 
* GFX Project

Each singular document contains relevant fields that can be modified and filled out. GFX Project is a "special" document as there can be multiple pages of this type (each page represents a different project).

Certain fields have a **description** for the ideal content that best fits them (e.g. ".svg preferred. Should be a white logo on transparent background").

When you are finished editing a Sanity document and wish to publish it, **YOU MUST CLICK PUBLISH** in the lower right corner. Otherwise, your changes will just become a draft. 

There are various access limits on the Sanity free plan, but the most important are **Assets** and **Bandwidth** so be wise when choosing whether to upload a video/image directly or host it elsewhere (YouTube, Vimeo, etc.). Your limits can be viewed and managed [here](https://www.sanity.io/organizations/obUcQzySU/project/12s4nb6j?orgId=obUcQzySU) (login through Github).

Any additional questions should be directed to [Benjamin Edwards](mailto:bkedwards4@gmail.com) 

P.S. To edit the `favicon.ico` (the little logo that appears in the browser tab) it must be directly added to the code by me.

# Sanity Video Recommendations
A few recommendations based on my experiences while developing:
* YouTube/Vimeo/Uploads all generally load fine on laptops/computers.
* Vimeo has trouble loading on mobile. I have not had any issues with YouTube or Uploads though.

I would recommend starting with Uploads for media that immediately appear on page load (i.e. the home page title video, the first few GFX Work thumbnails, etc). I would use YouTube for all other videos. 

Still, I would keep in mind bandwith limits, especially for a large high-resolution title video.

# For Developers

To locally deploy website, open code in dev container and then run:
```
npm start -- --host 0.0.0.0 --port 4200 --disable-host-check
```

To run Sanity locally, navigate to `studio-gm-motion` folder:
```
cd studio-gm-motion
``` 
and run
```
npm run dev -- --host 0.0.0.0
```

To deploy Sanity, navigate to the `studio-gm-motion` folder and login using
```
npx sanity login
```
Select `gm-motion` as the project and login through Github. Once logged in, you can deploy the project using
```
npx sanity deploy
```