import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

// Components
import Spinner from "./../components/Spinner";

// Firebase Authentication
import { getAuth } from "firebase/auth";

// Firebase Database
import { db } from "../firebase.config";

// Firebase Firestore
import { getDoc, doc } from "firebase/firestore";

// Formats
import { formatCurrency } from "../formats/currency.format";

// Icons
import shareIcon from "../assets/svg/shareIcon.svg";

// Leaflet
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

// Leaflet Marker
import { pinkMarker, blueMarker } from "../markers/leaflet.marker";

// Swiper Core
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from "swiper";

// Swiper and Slider
import { Swiper, SwiperSlide } from "swiper/react";

// Swiper Styles
import "swiper/swiper-bundle.css";

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const navigate = useNavigate();

  const params = useParams();

  const auth = getAuth();

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, "listings", params.listingId);

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log(docSnap.data());

        setListing(docSnap.data());

        setLoading(false);
      }
    };

    fetchListing();
  }, [navigate, params.listingId]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <main>
      <Swiper
        slidesPerView={1}
        pagination={{ clickable: true }}
        className="swiper-container"
      >
        {listing.imgUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                background: `url(${listing.imgUrls[index]}) center no-repeat`,
                backgroundSize: "cover",
              }}
              className="swiperSlideDiv"
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        className="shareIconDiv"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);

          setShareLinkCopied(true);

          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <img src={shareIcon} alt="" />
      </div>

      {shareLinkCopied && <p className="linkCopied">Link Copied</p>}

      <div className="listingDetails">
        <p className="listingName">
          {listing.name} - €
          {formatCurrency(
            listing.offer ? listing.discountedPrice : listing.regularPrice
          )}
        </p>

        <p className="listingLocation">{listing.location}</p>

        <p className="listingType">
          For {listing.type === "rent" ? "Rent" : "Sale"}
        </p>

        {listing.offer && (
          <p className="discountPrice">
            €{formatCurrency(listing.regularPrice - listing.discountedPrice)}{" "}
            discount
          </p>
        )}

        <ul className="listingDetailsList">
          <li>
            {listing.bedrooms > 1
              ? `${listing.bedrooms} Bedrooms`
              : `1 Bedroom`}
          </li>
          <li>
            {listing.bathrooms > 1
              ? `${listing.bathrooms} Bathrooms`
              : `1 Bathroom`}
          </li>
          <li>{listing.parking && "Parking Spot"}</li>
          <li>{listing.furnished && "Furnished"}</li>
        </ul>

        <p className="listingLocationTitle">Location</p>

        <div className="leafletContainer">
          <MapContainer
            style={{ height: "100%", width: "100%" }}
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
              url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
            />

            <Marker
              position={[listing.geolocation.lat, listing.geolocation.lng]}
              icon={listing.type === "rent" ? pinkMarker : blueMarker}
            >
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${listing.userRef}?listingName=${listing.name}`}
            className="primaryButton"
          >
            Contact Landlord
          </Link>
        )}
      </div>
    </main>
  );
}

export default Listing;

/*
  https://stackoverflow.com/questions/67552020/how-to-fix-error-failed-to-compile-node-modules-react-leaflet-core-esm-pat
*/
