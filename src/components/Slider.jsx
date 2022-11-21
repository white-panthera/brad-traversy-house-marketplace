import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Components
import Spinner from "../components/Spinner";

// Firebase Database
import { db } from "../firebase.config";

// Firebase Firestore
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";

// Formats
import { formatCurrency } from "../formats/currency.format";

// Swiper Core
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from "swiper";

// Swiper and Slider
import { Swiper, SwiperSlide } from "swiper/react";

// Swiper Styles
import "swiper/swiper-bundle.css";

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

function Slider() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);

  // Navigation
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      const listingsRef = collection(db, "listings");

      const q = query(listingsRef, orderBy("timestamp", "desc"), limit(5));

      const querySnap = await getDocs(q);

      let listings = [];

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListings(listings);

      setLoading(false);
    };

    fetchListing();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (listings.length === 0) {
    return <></>;
  }

  return (
    listings && (
      <>
        <p className="exploreHeading">Recommended</p>

        <Swiper slidesPerView={1} pagination={{ clickable: false }}>
          {listings.map(({ data, id }) => (
            <SwiperSlide
              key={id}
              onClick={() => navigate(`/category/${data.type}/${id}`)}
              style={{ height: "300px", cursor: "pointer" }}
            >
              <div
                style={{
                  background: `url(${data.imgUrls[0]}) center no-repeat`,
                  backgroundSize: "cover",
                }}
                className="swiperSlideDiv"
              >
                <p className="swiperSlideText">{data.name}</p>
                <p className="swiperSlidePrice">
                  €{formatCurrency(data.discountedPrice ?? data.regularPrice)}{" "}
                  {data.type === "rent" && "/ month"}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  );
}

export default Slider;
