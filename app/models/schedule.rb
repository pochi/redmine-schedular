class Schedule < ActiveRecord::Base
  unloadable

  belongs_to :project
  before_save :set_color
  validates_uniqueness_of :title, :scope => :project_id
  validates_presence_of :title
  validates_presence_of :license
  has_many :events, :dependent => :destroy
  has_many :license_counts, :dependent => :destroy
  has_many :license_participations, :dependent => :destroy

  COLORS = [
    '#b3dc6c',
    '#f691b2',
    '#4986e7',
    '#fa573c',
    '#7bd148'
  ].freeze

  def to_hash_with_events(date)
    { id: id,
      name: title,
      license: license,
      color: color,
      events: self.events.where("start_date >= ?", date)
                         .where("start_date < ?", date + 1.month),
      visiable: self.license_participations.find_by_user_id(User.current.id) ? false : true }
  end

  private
  def set_color
    self.color = COLORS[self.class.count % 5] if self.color.empty?
  end
end
