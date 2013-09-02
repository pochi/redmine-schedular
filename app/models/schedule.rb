class Schedule < ActiveRecord::Base
  unloadable

  belongs_to :project
  before_save :set_color
  validates_uniqueness_of :title, :scope => :project_id
  has_many :events, :dependent => :destroy
  has_many :license_counts, :dependent => :destroy

  COLORS = [
    'rgb(179, 220, 108)',
    'rgb(246, 145, 178)',
    'rgb(73, 134, 231)',
    'rgb(250, 87, 60)',
    'rgb(123, 209, 72)'
  ].freeze

  def to_hash_with_events
    { id: id,
      name: title,
      license: license,
      color: color,
      events: self.events }
  end

  private
  def set_color
    self.color ||= COLORS[self.class.count % 5]
  end
end
