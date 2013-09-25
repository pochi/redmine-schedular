class Event < ActiveRecord::Base
  unloadable
  belongs_to :schedule
  validates_presence_of :start_date
  validates_presence_of :end_date
  validates_presence_of :content
  validates_presence_of :user_id
  before_save :check_license, :update_count
  before_destroy :destroy_license_count

  private
  def update_count
    self.start_date.upto(self.end_date) do |date|
      license_count = LicenseCount.find_or_initialize_by_schedule_id_and_date(self.schedule_id, date)
      license_count.count += 1
      license_count.save
    end
  end

  def check_license
    self.start_date.upto(self.end_date) do |date|
      license_count = self.schedule.license_counts.find_by_date(date)
      next unless license_count
      if license_count.count >= self.schedule.license
        self.errors.add(:date, "#{date}のライセンス数の上限にひっかかっています")
        return false
      end
    end
  end

  def destroy_license_count
    self.start_date.upto(self.end_date || self.start_date) do |date|
      license_count = self.schedule.license_counts.find_by_date(date)
      license_count.count -= 1
      license_count.save
    end
  end
end
