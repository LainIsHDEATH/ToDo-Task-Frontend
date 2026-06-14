import homeIllustration from '../assets/home-illustration.svg'

export function HomePage() {
    return (
        <section className="home-page">
            <div className="home-content">
                <h1>Tasks</h1>

                <p>
                    Tasks is a frontend client for managing users and their tasks.
                </p>
            </div>

            <img
                className="home-image"
                src={homeIllustration}
                alt="Task management illustration"
            />
        </section>
    )
}