"use client";

import React, { useState, useEffect, useRef } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/apiResponse";
import { CldImage } from "next-cloudinary";
import { useToast } from "@/hooks/use-toast";

type socialFormat = keyof typeof socialFormats;

//NOTE - Here we manage the aspect ratio of the image
const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
};


export default function SocialSharePage() {

  const { toast } = useToast();

  //NOTE - Here we manage the state of the image as we upload it as a string to cloudinary
  const [uploadedImage, setUploadedImage] = useState<string | null>();

  //NOTE - Here we manage the state of the selected format
  const [selectedFromat, setSelectedFromat] = useState<socialFormat>(
    "Instagram Square (1:1)"
  );

  //NOTE - manage state of, check if image is uploading then give upload animation
  const [isUploading, setIsUploading] = useState(false);


  //NOTE - manage state of, check if image is formatting then give upload animation
  const [isTransforming, setIsTransforming] = useState(false);

  //NOTE - here we identify the image uploaded in cloudinary and store an reference
  const imageRef = useRef<HTMLImageElement>(null);

  //NOTE - here we check and initialize the transformation of the image
  useEffect(() => {
    if (uploadedImage) {
      setIsTransforming(true);

      toast({
        title: "Transforming",
        description: "Please wait while we transform the image",
        variant: "default",
      });
    }
  }, [uploadedImage, selectedFromat, toast]);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    //NOTE - Here we upload the image to cloudinary
    const file = event.target.files?.[0];
    if (!file) {

      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });

      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/image-upload", formData);

      console.log("Total response for image upload:", response);

      if (!response.data) {
        console.log("Error while uploading image", response?.data.message);

        toast({
          title: "Error",
          description:
            response?.data.message ||
            "Something went wrong while uploading image",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: response?.data.message || "Image uploaded successfully",
        variant: "default",
      });

      setUploadedImage(response?.data.publicId);

    } catch (error) {
      console.error("Error while uploading image", error);
      const axiosError = error as AxiosError<ApiResponse>;

      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ||
          "Something went wrong while uploading image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleFileDownload() {
    if (!imageRef.current) {

      toast({
        title: "Error",
        description: "Invalid image reference",
        variant: "destructive",
      });

      return;
    }

    try {
      //NOTE - Here instead of web request the image from cloudinary we modify the request to get the image from the image reference as a blob
      const response = await axios(imageRef?.current.src, { responseType: 'arraybuffer' });

      if (!response.data) {
        toast({
          title: "Error",
          description: "Something went wrong while downloading image, Please try again",
          variant: "destructive",
        })
        return;
      }

      //NOTE - here we crete a blob which is an object that represents a block of binary data
      const blob = new Blob([response.data], { type: 'auto' });

      //NOTE - here we crete a url out of the blob object
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `${selectedFromat.replace(/\s/g, "_").toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();

      //NOTE - here we remove the url from the browser cache after the download operation
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Image downloaded successfully",
        variant: "default",
      })


    } catch (error) {

      console.error("Error while downloading image", error);

      toast({
        title: "Error",
        description: "Something went wrong while downloading image, Please try again",
        variant: "destructive",
      })
    }



  }






  return (
    <div
      className="container mx-auto max-w-4xl p-4"
    >
      <h1
        className="txt-3xl font-bold mb-6 text-center"
      >
        Social Media Image Creator
      </h1>

      <div className="card">
        <div className="card-body">

          <h2
            className="card-title mb-4"
          >
            Upload an Image
          </h2>

          <div className="form-control">
            <label className="label">
              <span
                className="label-text"
              >
                Choose an image file
              </span>
            </label>

            <input
              type="file"
              onChange={handleFileUpload}
              className="file-input file-input-bordered file-input-primary w-full"
            />

          </div>

          {
            isUploading && (
              <div className="mt-4">
                <progress className="progress progress-primary"></progress>
              </div>
            )
          }

          {
            uploadedImage && (
              <div className="mt-6">
                <h2
                  className="card-title mb-4"
                >
                  Select Social Media Format
                </h2>

                <div className="form-control">

                  <select
                    name="" id=""
                    className="select select-bordered w-full"
                    onChange={(e) => setSelectedFromat(e.target.value as socialFormat)}
                  >
                    {
                      Object.keys(socialFormats).map((format) => (
                        <option
                          key={format}
                          value={format}
                        >
                          {format}
                        </option>
                      ))
                    }

                  </select>

                  <div
                    className="mt-6 relative"
                  >
                    <h3
                      className="text-lg font-semibold mb-2"
                    >
                      Preview
                    </h3>

                    <div
                      className="flex justify-center"
                    >
                      {
                        isTransforming && (
                          <div
                            className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10"
                          >
                            <span
                              className="loading loading-spinner"
                            ></span>
                          </div>
                        )
                      }

                      <div>
                        <CldImage
                          width={socialFormats[selectedFromat].width}
                          height={socialFormats[selectedFromat].height}
                          src={uploadedImage}
                          sizes="100vw"
                          alt="Transformed image"
                          crop="fill"
                          gravity="auto"
                          ref={imageRef}
                          onLoad={() => setIsTransforming(false)}
                        />
                      </div>

                    </div>

                  </div>

                  <div
                    className="mt-6 card-actions justify-end"
                  >
                    <button
                      className="btn btn-primary"
                      onClick={handleFileDownload}
                    >

                      Download for {selectedFromat}

                    </button>

                  </div>

                </div>

              </div>
            )
          }
        </div>


      </div>

    </div>
  );
}
