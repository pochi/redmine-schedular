class Event < ActiveRecord::Base
  unloadable
  belongs_to :schedule
  validates_presence_of :start_date
  validates_presence_of :end_date
  validates_presence_of :user_id
  before_save :check_license, :update_count
  before_destroy :destroy_license_count

  belongs_to :scheduler_custom_list_content, :foreign_key => :team_id

  private
  def update_count
    self.start_date.upto(self.end_date) do |date|
      license_count = LicenseCount.find_or_initialize_by(schedule_id: self.schedule_id, date: date)
      license_count.count += 1
      license_count.save
    end
  end

  def check_license
    self.start_date.upto(self.end_date) do |date|
      license_count = self.schedule.license_counts.find_by(date: date)
      next unless license_count
      if license_count.count.to_i >= self.schedule.license
        self.errors.add(:date, "#{date}のライセンス数の上限にひっかかっています")
        return false
      end
    end
  end

  def destroy_license_count
    self.start_date.upto(self.end_date || self.start_date) do |date|
      license_count = self.schedule.license_counts.find_by(date: date)
      license_count.count -= 1
      license_count.save
    end
  end
end
