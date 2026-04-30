export default function HeroSection({ categories, onSelectCategory }) {
  const displayCategories = (categories || []).slice(0, 8)

  return (
    <div className="heroSection">
      <div className="heroContent">
        <h2>Upgrade your skills with LearnHub</h2>
        <p>
          Learn with thousands of students. Access anytime, anywhere. Start for free today.
        </p>

        {displayCategories.length > 0 && (
          <div className="heroCategoryLinks">
            <button
              className="heroCategoryChip"
              type="button"
              onClick={() => onSelectCategory?.(null)}
            >
              All
            </button>
            {displayCategories.map((cat) => (
              <button
                key={cat.id}
                className="heroCategoryChip"
                type="button"
                onClick={() => onSelectCategory?.(cat.name)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
