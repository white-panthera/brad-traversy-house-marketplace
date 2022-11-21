import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Spinner from "./../components/Spinner";

// Firebase Authentication
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Firebase Database
import { db } from "../firebase.config";

// Firebase Firestore
import { serverTimestamp, collection, addDoc } from "firebase/firestore";

// Firebase Storage
import {
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
  ref,
} from "firebase/storage";

// React Toastify
import { toast } from "react-toastify";

// UUID
import { v4 as uuidv4 } from "uuid";

function CreateListing() {
  // eslint-disable-next-line
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  });

  const {
    discountedPrice,
    regularPrice,
    furnished,
    longitude,
    bathrooms,
    bedrooms,
    latitude,
    parking,
    address,
    images,
    offer,
    type,
    name,
  } = formData;

  const auth = getAuth();

  const navigate = useNavigate();

  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate("/sign-in");
        }
      });
    }

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  const onSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    if (discountedPrice >= regularPrice) {
      setLoading(false);

      toast.error("Discounted price needs to be less than regular price");

      return;
    }

    if (images.length > 6) {
      setLoading(false);

      toast.error("Max 6 images");

      return;
    }

    let geolocation = {};

    let location = "";

    if (geolocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
      );

      const data = await response.json();

      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;

      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;

      location =
        data.status === "ZERO_RESULTS"
          ? undefined
          : data.results[0]?.formatted_address;

      if (location === undefined || location.includes("undefined")) {
        setLoading(false);

        toast.error("Please enter a correct address");

        return;
      }
    } else {
      geolocation.lat = latitude;

      geolocation.lng = longitude;

      location = address;
    }

    // Store images in firebase
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();

        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

        const storageRef = ref(storage, `images/${fileName}`);

        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

            console.log("Upload is " + progress + "% done");

            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
              default:
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false);

      toast.error("Images not uploaded");

      return;
    });

    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
    };

    formDataCopy.location = address;

    delete formDataCopy.images;
    delete formDataCopy.address;

    // location && (formDataCopy.location = location);

    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    const docRef = await addDoc(collection(db, "listings"), formDataCopy);

    setLoading(false);

    toast.success("Listing saved");

    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  const onMutate = (e) => {
    let boolean = null;

    // Booleans
    if (e.target.value === "true") {
      boolean = true;
    }

    if (e.target.value === "false") {
      boolean = false;
    }

    // Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }

    // Text/Booleans/Numbers
    if (!e.target.files) {
      // ?? if the value on the left is null use the other value

      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Create a Listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className="formLabel">Sell / Rent</label>
          <div className="formButtons">
            <button
              type="button"
              id="type"
              className={type === "sale" ? "formButtonActive" : "formButton"}
              value="sale"
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type="button"
              id="type"
              className={type === "rent" ? "formButtonActive" : "formButton"}
              value="rent"
              onClick={onMutate}
            >
              Rent
            </button>
          </div>

          <label className="formLabel">Name</label>
          <input
            type="text"
            id="name"
            className="formInputName"
            minLength="10"
            maxLength="32"
            onChange={onMutate}
            value={name}
            required
          />

          <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input
                type="number"
                id="bedrooms"
                className="formInputSmall"
                min="1"
                max="50"
                onChange={onMutate}
                value={bedrooms}
                required
              />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input
                type="number"
                id="bathrooms"
                className="formInputSmall"
                min="1"
                max="50"
                onChange={onMutate}
                value={bathrooms}
                required
              />
            </div>
          </div>

          <label className="formLabel">Parking Spot</label>
          <div className="formButtons">
            <button
              type="button"
              id="parking"
              className={parking ? "formButtonActive" : "formButton"}
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              id="parking"
              className={
                !parking && parking !== null ? "formButtonActive" : "formButton"
              }
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              type="button"
              id="furnished"
              className={furnished ? "formButtonActive" : "formButton"}
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              id="furnished"
              className={
                !furnished && furnished !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Address</label>
          <textarea
            id="address"
            className="formInputAddress"
            onChange={onMutate}
            value={address}
            required
          />

          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  type="number"
                  id="latitude"
                  className="formInputSmall"
                  onChange={onMutate}
                  value={latitude}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  type="number"
                  id="longitude"
                  className="formInputSmall"
                  onChange={onMutate}
                  value={longitude}
                  required
                />
              </div>
            </div>
          )}

          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              type="button"
              id="offer"
              className={offer ? "formButtonActive" : "formButton"}
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              id="offer"
              className={
                !offer && offer !== null ? "formButtonActive" : "formButton"
              }
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Regular Price</label>
          <div className="formPriceDiv">
            <input
              type="number"
              id="regularPrice"
              className="formInputSmall"
              min="50"
              max="750000000"
              onChange={onMutate}
              value={regularPrice}
              required
            />
            {type === "rent" && <p className="formPriceText">€ / Month</p>}
          </div>

          {offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <div className="formPriceDiv">
                <input
                  type="number"
                  id="discountedPrice"
                  className="formInputSmall"
                  min="50"
                  max="750000000"
                  onChange={onMutate}
                  value={discountedPrice}
                  required
                />
              </div>
            </>
          )}

          <label className="formLabel">Images</label>
          <p className="imageInfo">
            The first image will be the cover (max 6).
          </p>
          <input
            type="file"
            id="images"
            className="formInputFile"
            max="6"
            accept=".jpg,.png,.jpeg"
            multiple
            onChange={onMutate}
            required
          />

          <button type="submit" className="primaryButton createListingButton">
            Create Listing
          </button>
        </form>
      </main>
    </div>
  );
}

export default CreateListing;
