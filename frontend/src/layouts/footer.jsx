import "./footer.css";

const FooterComponent = () => {
    return (
        <footer className="footer-container">
            <hr className="footer-divider"/>
            <div className="footer-content">
                <p className="footer-text">
                    &copy;itbank | <a href="#">Privacy</a> | <a href="#">Terms</a>
                </p>
            </div>
        </footer>
    );
};

export default FooterComponent;
