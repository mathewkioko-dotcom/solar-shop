import barakaLogo from "../../assets/logo/baraka-logo.svg";

import facebookIcon from "../../assets/icons/social/facebook.svg";
import instagramIcon from "../../assets/icons/social/instagram.svg";
import linkedinIcon from "../../assets/icons/social/linkedin.svg";
import youtubeIcon from "../../assets/icons/social/youtube.svg";
import expertSupportIcon from "../../assets/icons/ecommerce/expert-support.svg";
import genuineIcon from "../../assets/icons/ecommerce/genuine.svg";
import manufacturerWarrantyIcon from "../../assets/icons/ecommerce/manufacturer-warranty.svg";
import { Link } from "react-router-dom";
import { businessInfo } from "../../config/businessInfo";
import { footerShopLinks, informationNavigation } from "../../config/informationNavigation";
import { COMPANY } from "../../config/siteConfig";
import SvgIcon from "../ui/SvgIcon";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">

        {/* Company */}
        <div className="footer-brand">
          <img
            src={barakaLogo}
            alt="Baraka Solar Shop"
            className="footer-logo"
          />

          <p>
            Reliable solar products for homes, businesses and commercial
            installations across Kenya and East Africa.
          </p>

          <div className="social-links">
            <a
                href={COMPANY.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="social-link"
                >
                <SvgIcon src={facebookIcon} size={18} />
                </a>

            <a
              href={COMPANY.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="social-link"
            >
              <SvgIcon src={instagramIcon} size={18} />
            </a>

            <a
              href={COMPANY.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="social-link"
            >
              <SvgIcon src={linkedinIcon} size={18} />
            </a>

            <a
              href={COMPANY.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="social-link"
            >
              <SvgIcon src={youtubeIcon} size={18} />
            </a>
          </div>
        </div>

        {/* Shop */}
        <div className="footer-column">
          <h3>Shop</h3>

          {footerShopLinks.map((item) => (
            <Link key={item.label} to={item.path}>{item.label}</Link>
          ))}
        </div>

        {/* Customer Support */}
        <div className="footer-column">
          <h3>Customer Support</h3>

          {informationNavigation.map((item) => (
            <Link key={item.path} to={item.path}>{item.label}</Link>
          ))}
        </div>

        {/* Contact */}
        <div className="footer-column">
          <h3>Contact Us</h3>

          <p>{businessInfo.address}</p>
          <p>{businessInfo.phone}</p>
          <p>{businessInfo.salesEmail}</p>
          <p>{businessInfo.businessHours}</p>

          <div className="footer-certification">
            <span><SvgIcon src={genuineIcon} size={15} /> Genuine Products</span>
            <span><SvgIcon src={manufacturerWarrantyIcon} size={15} /> Manufacturer Warranty</span>
            <span><SvgIcon src={expertSupportIcon} size={15} /> Expert Support</span>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-content">

          <p>
            © {new Date().getFullYear()} Baraka Solar Shop. All rights reserved.
          </p>

          <div className="footer-bottom-links">
            <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
