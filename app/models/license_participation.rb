class LicenseParticipation < ActiveRecord::Base
  unloadable

  belongs_to :schedule
  belongs_to :user

  validates_uniqueness_of :user_id, :scope => :schedule_id
end

User.class_eval do
  has_many :license_participations
end
