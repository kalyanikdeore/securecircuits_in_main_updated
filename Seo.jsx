import { Helmet } from "react-helmet-async";

function Seo({ title, description }) {
    return (
        <Helmet>
            <title>{title}</title>

            <meta
                name="description"
                content={description}
            />

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />

            <meta
                name="robots"
                content="index, follow"
            />

            <meta
                name="author"
                content="Secure Circuits"
            />

            <meta
                property="og:title"
                content={title}
            />

            <meta
                property="og:description"
                content={description}
            />

            <meta
                property="og:type"
                content="website"
            />
        </Helmet>
    );
}

export default Seo;